// Clash Verge Rev script extension for converted literal proxies.
// Apply after using Personal_Advanced.ini. This is not a Mihomo YAML file.
function main(config) {
  const selfBuilt = /反代|自建|\bCF\b|Cloudflare|clone/i;
  for (const node of config.proxies || []) {
    if (!selfBuilt.test(node.name || "")) continue;
    if (!["vmess", "vless", "trojan", "ss"].includes(node.type)) continue;
    // Mihomo uses smux.enabled; generic mux:false is not its node-option syntax.
    delete node.mux;
    node.smux = Object.assign({}, node.smux || {}, { enabled: false });
    const ws = node["ws-opts"];
    if (!ws) continue;
    if (typeof ws.path === "string" && ws.path.includes("?")) {
      const pos = ws.path.indexOf("?");
      const base = ws.path.slice(0, pos);
      const kept = ws.path.slice(pos + 1).split("&").filter(part => {
        const key = part.split("=", 1)[0];
        try { return decodeURIComponent(key).toLowerCase() !== "ed"; }
        catch (_) { return true; }
      });
      ws.path = base + (kept.length ? "?" + kept.join("&") : "");
    }
    ws["max-early-data"] = 0;
    delete ws["early-data-header-name"];
  }
  return config;
}
