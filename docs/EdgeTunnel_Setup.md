# edgetunnel：在源头设置节点，并先验证一个节点

适用：cmliu/edgetunnel 面板，通过 SUBAPI.cmliussss.net 转换到 Mihomo。检查日期：2026-10-15。

采用普通 WebSocket、不主动启用 sing-mux 的保守基线。这减少客户端改写，不代表关闭后一定解决断流。无需额外安装 YAML 处理工具。

## 先在面板操作

1. 登录你自己的 edgetunnel 管理面板。先保存现有配置备份，备份留在本地。
2. 找到节点设置附近的 **启用0-RTT(ed=2560)**，取消勾选并保存。项目把这个开关叫 0-RTT，实际控制的是 WebSocket Early Data，不是 Cloudflare TLS 1.3 0-RTT。
3. 检查 PATH 有没有手工加入的 `?ed=2048`、`?ed=2560` 或 `&ed=...`；若有，只删除 ed 参数，保留路径、proxyip、token 等其他内容。开关关闭不会自动清理你手填在 PATH 里的 ed。
4. 订阅转换后端继续用原来的地址；SUBCONFIG 使用本仓库 Personal_Advanced.ini。无需给 INI 或 base.yaml 顶层添加 mux:false。
5. 先重新获取一份订阅用于单节点测试，成功后再更新正式订阅，并替换新版配套 JS。原订阅和原节点保留到测试完成。

对应实际配置字段是 `启用0RTT: false`。它是现有 edgetunnel config.json 内的一个字段，不是可以单独导入的完整配置；不要用一份删减 JSON 替换整个 KV 配置。

## 多路复用怎么确认

当前检查的 edgetunnel 普通 VLESS/Trojan URI 生成逻辑没有主动输出 Mihomo sing-mux 开启项，本仓库 INI 也不会添加 smux。

在重新转换的 **最终节点 YAML** 内确认：

- `smux.enabled` 不是 true。没有 smux 字段也可以，不必为了形式完整再加一个客户端脚本。
- WebSocket 节点路径没有用于 Early Data 的 ed 参数。
- `ws-opts.max-early-data` 缺省或为 0，没有依赖早期数据的 header 设置。
- 如果是 proxy-providers，需检查它实际下载的节点文件；仅看顶层配置无法证明节点参数。

若出现 smux.enabled:true，先在转换源/后端修正，不能靠本仓库 base.yaml 顶层关掉它。当前后端的无凭据测试请求返回 HTTP 403，未核实其实际转换输出。

SS/v2ray-plugin 还有另一种 mux，不能与 Mihomo sing-mux 混为一谈；本指南的单节点验证优先选择 VLESS/Trojan + WS。不要对 SS 插件参数盲目套用同一关闭方法。

## 用一个节点确认普通 WebSocket 能用

1. 将当前能用的完整配置另存为本地测试配置，关闭测试配置自动更新。找到一个 VLESS/Trojan、network:ws 的节点，复制并改名，例如 `civitai2-普通WS测试`。保留原节点用于恢复。
2. 只修改测试副本：设 smux.enabled:false；在 ws-opts.path 中只删除 ed 查询参数；设 max-early-data:0；移除 early-data-header-name。UUID/密码、server、port、TLS、servername、Host、路径主体及其他查询参数全部保持原样。如果没有 smux 或 early-data 字段，原本就是关闭状态，无需补齐。
3. 将测试节点加入所测业务组的候选，并 **直接选中测试节点**，不要选自动测速、故障转移或 DIRECT。如果测试 AI，确认它是真实允许地区的节点；名字不会改变实际出口。新版 JS 不会改写这个测试节点，但会按名称限定自动测速范围；直接手动选中不受该范围限制。
4. 先运行一次延迟测试，再打开 YouTube 或 Holodex 的实际直播。到 Verge 连接页确认新连接链路的最后一个节点确实是测试副本，避免回退或旧连接造成误判。只看到测试延迟不能判定全部可用，某些 Worker 有本地测速应答逻辑。
5. 能通过这个节点加载外部网页并持续收发数据，说明普通 WebSocket 握手、节点鉴权和所测目标的数据转发已经成功。进一步观察 10–20 分钟直播，并对比你原来会断开的场景；这只说明测试期间可用，不保证长期不掉线。
6. 若仍断开，切回同一个原节点，在相同目标、相同 DNS 和相近时间下对比。不要同时修改 DNS、TUN、IP、订阅更新频率等多个变量。若关闭后立即不能用，先恢复原配置并检查源头版本、Host/SNI/PATH 与服务端日志。

看到 HTTP **101 Switching Protocols** 仅说明 WebSocket 升级成功，不证明 UUID/密码正确，也不证明目标网站能够访问。直接在浏览器打开节点域名或用 curl 普通访问，并不能代替以上完整测试；Cloudflare 错误页面也不代表鉴权一定成功或失败。

## 为什么源码说明支持普通 WebSocket

此次检查的 `_worker.js` 默认 `启用0RTT:false`，只有开关为 true 时才自动追加 ed。服务端读取 `sec-websocket-protocol` 后，仅在该头非空时解码 Early Data；同时独立注册 message 事件处理后续数据。因此当前源码允许不携带 Early Data，先完成握手再发送数据。

你的已部署版本、环境变量和路径设置可能不同，仍须用测试节点确认。未登录或改动用户面板、KV 或 Cloudflare 服务。

## 顺便解决新订阅总是 180 分钟

当前 edgetunnel 默认 `优选订阅生成.SUBUpdateTime:3`，并用它生成 `Profile-Update-Interval` 响应头，单位小时。这是当前项目中新订阅默认 180 分钟的明确来源。

如需源头改为一天一次，将现有配置中该字段调整为 24（界面未提供时，需在自己的现有完整配置中修改并保留其余字段）。已有 Verge 订阅仍建议在“编辑信息”中明确填写 1440 分钟，不假定它会覆盖已有客户端设置。

## 来源与验证边界

- [edgetunnel 已审查源码](https://github.com/cmliu/edgetunnel/blob/a8ab11125ece9bc27983f609a6359be81b21050c/_worker.js)：默认设置、URI 生成、握手/message/Early Data、订阅响应头。
- [项目公开管理面板](https://edt-pages.github.io/admin)：开关名称；没有登录用户站点。
- [Xray WebSocket](https://xtls.github.io/config/transports/websocket.html)：ed 参数和 Early Data 的作用。
- [Cloudflare WebSockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/)：升级、message 和 WebSocket 生命周期。

已完成源码审查与本仓库本机转换/核心检查。尚未测试用户真实节点、后台开关状态、转换后端实际输出、直播或 Codex 连接。

当前配套脚本另外负责额度节省：关闭 provider 默认全量健康检查、建立 900 秒 civitai 隐藏检测池、保留 AI 前置保障。即使节点源头已是普通 WS，完整额度节省仍需使用此脚本。详见 [主说明](Personal_Advanced.md)。
