import * as vscode from "vscode";

export class DashboardProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "baseline-sentinel.dashboard";
  constructor(private ctx: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    interface WebviewMessage { command: string; }
    webviewView.webview.onDidReceiveMessage(async (msg: WebviewMessage) => {
      if (msg.command === "rescan") {
        await vscode.commands.executeCommand("baseline-sentinel.scanWorkspace");
        const findings = this.ctx.globalState.get<any[]>("baseline.findings") || [];
        webviewView.webview.postMessage({ type: "data", findings });
      }
    });
  }

  private _getHtml() {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: system-ui; background: linear-gradient(135deg,#0f1724,#111827); padding:12px; color:#eee; }
    .card { border-radius:18px; padding:12px; background: rgba(255,255,255,0.05); box-shadow: 8px 12px 30px rgba(0,0,0,0.6); }
    h3 { margin:0 0 8px 0; color:#9bd1ff; }
    button { background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h3>Baseline Sentinel</h3>
    <canvas id="chart" width="220" height="220"></canvas>
    <div style="margin-top:8px">
      <button id="rescan">Scan Workspace</button>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('rescan').addEventListener('click', ()=> vscode.postMessage({command:'rescan'}));
    window.addEventListener('message', e => {
      const msg = e.data;
      if (msg.type === 'data') render(msg.findings || []);
    });
    function render(findings) {
      const totals = {safe:0, risky:0, unsupported:0};
      findings.forEach(f=> totals[f.status] = (totals[f.status]||0)+1);
      const data = [totals.safe, totals.risky, totals.unsupported];
      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {type:'doughnut',
        data:{labels:['Safe','Risky','Unsupported'],
        datasets:[{data,backgroundColor:['#4caf50','#ff9800','#f44336']}]}
      });
    }
  </script>
</body>
</html>`;
  }
}
