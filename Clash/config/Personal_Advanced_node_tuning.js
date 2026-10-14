// Clash Verge Rev script: conditional group fallbacks and literal node tuning.
// Apply after using Personal_Advanced.ini. This is not a Mihomo YAML file.
function main(config) {
  // Frequent services and manual cards first; also applies to cached converted profiles.
  const panelOrder = ["🖐️ 手动切换", "📹 油管视频", "🔍 谷歌服务", "🤖 AI 专线", "🖐️ AI手动切换", "📦 模型下载", "⚡ R2直连加速", "🚀 节点选择", "📲 电报与社媒", "🎵 Spotify", "🎬 国际媒体", "Ⓜ️ 微软服务", "🍎 苹果服务", "🎯 全球直连", "🛑 广告拦截", "🐟 漏网之鱼", "🇺🇲 美国节点", "🇯🇵 日本节点", "🇸🇬 狮城节点", "🇹🇼 台湾节点", "🇭🇰 香港节点", "♻️ 自动选择", "🔄 故障转移"];
  const panelRank = new Map(panelOrder.map((name, index) => [name, index]));
  config["proxy-groups"] = (config["proxy-groups"] || []).map((group, index) => ({group, index}))
    .sort((a, b) => (panelRank.has(a.group.name) ? panelRank.get(a.group.name) : 1000 + a.index)
      - (panelRank.has(b.group.name) ? panelRank.get(b.group.name) : 1000 + b.index))
    .map(item => item.group);
  const manualEntries = {"🚀 节点选择":"🖐️ 手动切换", "📹 油管视频":"🖐️ 手动切换",
    "🔍 谷歌服务":"🖐️ 手动切换", "📦 模型下载":"🖐️ 手动切换",
    "⚡ R2直连加速":"🖐️ 手动切换", "🤖 AI 专线":"🖐️ AI手动切换"};
  for (const group of config["proxy-groups"]) {
    const manual = manualEntries[group.name];
    if (!manual || !Array.isArray(group.proxies) || !group.proxies.includes(manual)
        || group.proxies[0] === manual) continue;
    const first = group.proxies[0];
    group.proxies = [first, manual].concat(group.proxies.slice(1).filter(name => name !== manual));
  }
  const realNodes = new Set((config.proxies || []).map(n => n.name));
  const backups = {
    "♻️ 自动选择": "🖐️ 手动切换",
    "🇺🇲 美国节点": "🖐️ AI手动切换",
    "🇯🇵 日本节点": "🖐️ AI手动切换",
    "🇸🇬 狮城节点": "🖐️ AI手动切换",
    "🇹🇼 台湾节点": "🖐️ AI手动切换",
    "🇭🇰 香港节点": "🖐️ 手动切换"
  };
  for (const group of config["proxy-groups"] || []) {
    const dynamic = Array.isArray(group.use) && group.use.length > 0;
    if (["🖐️ 手动切换", "🖐️ AI手动切换"].includes(group.name) && dynamic) {
      group["empty-fallback"] = "REJECT";
      group.proxies = (group.proxies || []).filter(name => name !== "REJECT");
    }
    const backup = backups[group.name];
    if (!backup || group.type !== "url-test" || !Array.isArray(group.proxies)) continue;
    if (dynamic) {
      // Mihomo forbids a strategy group as empty-fallback. A dynamic provider
      // cannot be inspected by this profile script, so keep the safe manual
      // candidate explicitly. It can participate in latency selection.
      group["empty-fallback"] = "REJECT";
      if (!group.proxies.includes(backup)) group.proxies.push(backup);
      continue;
    }
    // Manual is a missing-region fallback, not a faster cross-region competitor.
    if (group.proxies.some(name => realNodes.has(name))) {
      group.proxies = group.proxies.filter(name => name !== backup);
    } else if (!group.proxies.includes(backup)) {
      group.proxies.push(backup);
    }
  }
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
