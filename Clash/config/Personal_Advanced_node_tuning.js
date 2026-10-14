// Clash Verge Rev script: AI priority guard and conditional group fallbacks.
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
  // Preserve group and select-candidate order from the converted INI.
  // Only conditional measurement-pool fallbacks are adjusted below.
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
  // Transport settings belong to the edgetunnel subscription source.
  // Do not rewrite node paths, credentials, plugin options, smux or Early Data here.
  return config;
}
