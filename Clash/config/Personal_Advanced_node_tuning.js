// Clash Verge Rev script: AI guard, manual recovery and civitai-only quota checks.
// Legacy filename retained; node transport fields are preserved unchanged.
// Apply after using Personal_Advanced.ini. This is not a Mihomo YAML file.
function main(config) {
  // Guard core OpenAI domains even if an older media list precedes the AI list.
  // Skip profiles without the policy, avoiding dangling rule references.
  if ((config["proxy-groups"] || []).some(group => group.name === "🤖 AI")) {
    const aiRules = ["chatgpt.com", "openai.com", "oaistatic.com", "oaiusercontent.com"]
      .map(domain => "DOMAIN-SUFFIX," + domain + ",🤖 AI");
    const guards = new Set(aiRules);
    config.rules = aiRules.concat((config.rules || []).filter(rule => !guards.has(rule)));
  }
  // Keep panel order, node fields and provider transport/download settings intact.
  const poolFilter = "(?i)^(?!.*(🇬🇧|英国|英國|伦敦|倫敦|沪英|深英|京英|英区|(?:^|[^A-Za-z0-9])(?:UK[0-9]*|GB[0-9]*|London|United[ _-]?Kingdom[0-9]*)(?:$|[^A-Za-z0-9]))).*(civitai).*$";
  const poolRegex = new RegExp(poolFilter.replace("(?i)", ""), "i");
  const testUrl = "http://www.gstatic.com/generate_204";
  const regionNames = new Set(["🇺🇲 美国节点", "🇯🇵 日本节点", "🇸🇬 狮城节点", "🇹🇼 台湾节点", "🇭🇰 香港节点"]);
  const manualNames = new Set(["🖐️ 手动切换", "🖐️ AI手动切换"]);
  const autoNames = new Set(["♻️ 自动选择", "🔄 故障转移"]);
  const realNodes = new Set((config.proxies || []).map(n => n.name));
  // A nonempty default URL tests every provider node, even with enable:false
  // when an automatic group registers another task. Empty it as well.
  for (const provider of Object.values(config["proxy-providers"] || {})) {
    provider["health-check"] = Object.assign({}, provider["health-check"] || {}, {
      enable: false, url: "", interval: 0, lazy: true
    });
  }
  const extraGroups = [];
  for (const group of [...(config["proxy-groups"] || [])]) {
    const dynamic = Array.isArray(group.use) && group.use.length > 0;
    if (regionNames.has(group.name)) {
      group.type = "select";
      for (const key of ["url", "interval", "tolerance", "lazy", "expected-status"]) delete group[key];
    }
    if (manualNames.has(group.name) && dynamic) {
      group["empty-fallback"] = "REJECT";
      group.proxies = (group.proxies || []).filter(name => name !== "REJECT");
    }
    if (!autoNames.has(group.name)) continue;
    // A visible select wrapper exposes manual recovery without health-checking it.
    // The hidden engine contains only matching nodes; provider membership is dynamic.
    const engineName = group.name === "♻️ 自动选择" ? "内部·civitai自动" : "内部·civitai故障转移";
    const existing = (config["proxy-groups"] || []).find(g => g.name === engineName);
    const engine = existing || Object.assign({}, group);
    engine.name = engineName;
    engine.type = group.name === "♻️ 自动选择" ? "url-test" : "fallback";
    engine.filter = poolFilter;
    engine.interval = 900;
    engine.lazy = true;
    engine.url = testUrl;
    engine.hidden = true;
    const engineDynamic = Array.isArray(engine.use) && engine.use.length > 0;
    if (engineDynamic) {
      engine["empty-fallback"] = "REJECT";
      engine.proxies = [];
    } else {
      const matched = (engine.proxies || []).filter(name => realNodes.has(name) && poolRegex.test(name));
      engine.proxies = matched.length ? matched : ["REJECT"];
    }
    if (!existing) extraGroups.push(engine);
    group.type = "select";
    group.proxies = [engineName, "🖐️ 手动切换"];
    for (const key of ["use", "filter", "exclude-filter", "exclude-type", "include-all", "include-all-proxies", "include-all-providers", "url", "interval", "tolerance", "lazy", "expected-status", "empty-fallback"]) delete group[key];
  }
  config["proxy-groups"] = (config["proxy-groups"] || []).concat(extraGroups);
  // Transport settings belong to the edgetunnel subscription source.
  // Do not rewrite node paths, credentials, plugin options, smux or Early Data here.
  return config;
}
