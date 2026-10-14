# 个人 Clash / Mihomo 分流配置

适用于 Clash Verge Rev 的个人订阅转换与配套覆写。新方案版本：2026-10-15，20 组精简与自由排序版。

- [完整设计、使用方法与测试清单](docs/Personal_Advanced.md)
- [Subconverter INI 模板](Clash/config/Personal_Advanced.ini)
- [Mihomo override.yaml](Clash/config/Personal_Advanced_override.yaml)
- [AI 优先级与回退保护脚本](Clash/config/Personal_Advanced_node_tuning.js)
- [来源与变更记录](docs/Personal_Advanced_sources.json)
- [本地验证结果](docs/Personal_Advanced_validation.json)

特点：AI 安全候选池、五地区测速、共享故障转移、Civitai/R2 鉴权与传输分离、StabilityMatrix 进程兜底、DNS/Fake-IP/嗅探配套。通用 AI、Google、Spotify、Twitter 等直接跟踪 MetaCubeX / blackmatrix7 / ACL4SSR 上游；模型下载等个人需求整理为 rule/Personal/ 下的四份策略清单。原 rule/ 下的 9 份规则及旧快照原样留存，新模板不再引用它们。

`.ini` 是转换器输入，必须先生成 Clash YAML。覆写片段也不是独立订阅。需要自己的有效节点；本次通过配置解析和实际本机转换检查，未测试真实机场、下载速度、断流恢复或 TUN 联网。

最新调整：全 CF 订阅不再另设优选池；20 组，普通手动及油管/谷歌/AI/模型等常用业务在前，SEA 默认美国，共享挑战域名走普通节点选择。AI 保留一个安全手动池维持港英隔离。provider 地区组可能跨安全地区回退，锁区业务应固定选节点。

面板当前前八项：普通手动、油管、谷歌、AI、AI手动、模型下载、R2、节点选择。业务组的手动候选也靠前，默认首选保持原状。面板排序以 INI 的 custom_proxy_group 行序为准，新脚本不再覆盖自定义排列。请同时更新模板、脚本并重新转换。

通用源在重新转换时更新；本次核实全部 29 条公共引用。模型下载只引用一次 ModelDownload.list，R2Direct、Direct、Proxy 各引用一次。上游审查提交和哈希见来源表。已通过 Extended/Mihomo 检查，旧 Subconverter 的 DOMAIN-REGEX 支持需另行确认。

微软和苹果公共规则统一进入全球直连，Spotify 并入国际媒体，共减少三个业务组。AI/Copilot 与其他更早的业务规则仍优先。域名分流 ruleset 的优先级不可按 UI 排列随意改动。

模型下载组支持直接选择名称含 civitai 的节点（忽略大小写、排除英国标签），保留原默认与回退候选，无需另建节点池。

自建节点已改用 [edgetunnel 源头设置与单节点验证](docs/EdgeTunnel_Setup.md)：先在面板关闭 Early Data，再更新订阅。新版配套 JS 不再改写节点路径、smux 或 Early Data，只保留 AI 与回退保护。
