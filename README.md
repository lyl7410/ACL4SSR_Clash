# 个人 Clash / Mihomo 分流配置

2026-10-15：Cloudflare 额度节省版，适用于 Clash Verge Rev。

- [操作流程、设计说明与验收清单](docs/Personal_Advanced.md)
- [订阅转换 INI](Clash/config/Personal_Advanced.ini)
- [配套 JavaScript 脚本](Clash/config/Personal_Advanced_node_tuning.js)
- [Mihomo YAML 覆写](Clash/config/Personal_Advanced_override.yaml)
- [edgetunnel 源头设置](docs/EdgeTunnel_Setup.md)
- [来源记录](docs/Personal_Advanced_sources.json) · [本地测试结果](docs/Personal_Advanced_validation.json)

自动选择/故障转移只检测名称含 civitai 的非英国节点，忽略大小写，900 秒、懒检测、相同 URL；五地区改手动，不再全量测速。普通手动仍保留订阅的非英国节点，AI 候选维持港英隔离。面板沿用当前顺序，20 个可见入口，脚本另加两个隐藏检测池。

**更新时同时重新转换 INI、替换订阅脚本。** 脚本关闭所有动态名称 provider 的默认全量健康检查，不修改节点路径、smux 或 Early Data。没有合法 civitai 节点时，在自动/故障转移入口主动切到手动；不会自动扫描全量或回退直连。完整节省逻辑依赖脚本，单用 INI 不足。

订阅更新建议在 Verge 手动确认 1440 分钟。单套持续运行检测任务的每日理论量约为匹配数 × 96；实际受启动、懒检测、共享去重、重试、其他设备和手动测速影响。匹配到全部 200 条时仍会检测全部，不能保证账户每日总额度。

AI、油管/Holodex、Google、模型下载、R2 默认直连、广告与域名规则顺序保持原有设计。通用规则引用 MetaCubeX、blackmatrix7、ACL4SSR；个人例外整理在 rule/Personal/ 四份列表。原 rule/ 九份文件与旧快照原样保留。

`.ini` 是转换器输入，必须先生成 Clash YAML，不能直接作为 Mihomo 配置加载；override 只是补充片段，base 已包含这些参数。脚本代码放订阅 JavaScript 扩展，YAML 放合并编辑器。

已完成本机实际转换、核心检查、策略/AI 隔离及 200 条模拟节点的检测范围与 lazy 运行验证；未使用真实节点凭据、未操作 Cloudflare 面板，也未实测真实联网或每日额度变化。
