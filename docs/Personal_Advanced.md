# Clash 个人高阶分流与大文件下载配置

版本：2026-10-15，20 组精简与自由排序版。面向 Clash Verge Rev / Mihomo，采用服务分组、地区自动选择与一个共享故障转移池，通用业务直接使用已核实的 MetaCubeX、ACL4SSR、blackmatrix7 上游规则，个人部分仅保留四份按策略整理的例外。实际语法验证核心：Mihomo v1.19.32；实际转换器：SubConverter-Extended v1.9.14。

## 文件入口

- [Personal_Advanced.ini](../Clash/config/Personal_Advanced.ini)：订阅转换模板。
- [Personal_Advanced_override.yaml](../Clash/config/Personal_Advanced_override.yaml)：Mihomo YAML 覆写片段，含 DNS、Fake-IP 豁免、保活和嗅探。
- [Personal_Advanced_base.yaml](../Clash/config/Personal_Advanced_base.yaml)：转换底稿，已包含覆写参数；INI 的 clash_rule_base 使用它。
- [Personal_Advanced_node_tuning.js](../Clash/config/Personal_Advanced_node_tuning.js)：Verge 订阅脚本，保留 AI 规则优先级并处理缺地区回退；不再修改节点传输参数，历史文件名保留。
- [Personal_Advanced_sources.json](Personal_Advanced_sources.json)：跟踪分支 URL、本次审查提交、SHA-256、个人条目覆盖记录、分组与顺序。
- [Personal_Advanced_validation.json](Personal_Advanced_validation.json)：本地解析、实际转换、分组隔离与路由检查结果。
- [rule/Personal/](../rule/Personal/)：仅含 ModelDownload、R2Direct、Direct、Proxy 四份个人例外。

订阅转换模板直链：

```text
https://raw.githubusercontent.com/lyl7410/ACL4SSR_Clash/main/Clash/config/Personal_Advanced.ini
```

覆写配置直链：

```text
https://raw.githubusercontent.com/lyl7410/ACL4SSR_Clash/main/Clash/config/Personal_Advanced_override.yaml
```

本方案不含真实订阅、服务器凭据或节点。`.ini` 必须先转换成 Clash YAML，不能直接导入 Mihomo；override.yaml 是补充片段，也不能当成独立订阅。

## 使用步骤

1. 在自己的 Subconverter / SubConverter-Extended 前端选择 Clash 输出，传入机场订阅，并把上面的 INI 直链填写到“远程配置/外部配置”项。自建本机转换器可避免把机场 URL 交给公共转换站。
2. 转换接口参数为 `target=clash`、`url=<机场订阅 URL>`、`config=<INI 直链>`；参数要 URL 编码。转换器还必须能下载 INI 引用的基础 YAML、个人例外列表和上游分支的公共列表。
3. 将转换后的 YAML 导入 Clash Verge Rev。首次确认 `🤖 AI` 默认美国、`⚡ R2直连加速` 默认 DIRECT、`📦 模型下载` 默认通用故障转移。
4. 转换结果已经通过 base.yaml 带上 override 参数。如果客户端会重写 DNS 等字段，或使用自己的转换底稿，在该订阅的 **YAML 合并/覆写编辑器** 应用 override.yaml，并检查最终运行配置。不要把 YAML 粘贴到 JavaScript 脚本编辑器。
5. 将 node_tuning.js 放入该订阅的 **JavaScript 脚本扩展**。它处理 AI 规则优先级、地区回退以及 provider 手动池的空池行为。先按 [edgetunnel 源头设置与单节点验证](EdgeTunnel_Setup.md) 关闭源头 Early Data，再换用新版脚本；节点传输设置由源头负责。
6. 先测试系统代理，再在 Verge 中以必要的服务/管理员权限启用 TUN。底稿默认 TUN 关闭；单纯设置进程规则不代表应用所有流量已被接管。

Clash Verge Rev 的编辑器名称随版本不同。YAML 片段走 Merge，`function main(config)` 代码走 Script。出现脚本错误时，客户端可能沿用旧配置，必须核对最终配置及日志。OpenClash 应将字段合并进完整运行 YAML 或其相应自定义覆写机制，不能假定导入 INI 已设置路由器系统 DNS、透明代理或权限。

若自定义使用一个只含节点/provider 的原生 Mihomo 配置，须另行加入本方案策略组与规则；override.yaml 本身不提供这些字段。DNS policy 引用本方案业务组，因此不能随意搭配不同组名的配置。

## 规则顺序与业务分流

| 顺序 | 内容 | 策略 |
|---|---|---|
| 1 | LocalAreaNetwork、UnBan | 全球直连 |
| 2 | 精确 challenges.cloudflare.com 兼容规则 | 普通节点选择，避免强绑 AI 组及被其他列表提前捕获 |
| 3 | BanProgramAD、BanAD | 广告拦截，默认 REJECT |
| 4 | MetaCubeX OpenAI、Anthropic、Gemini、GitHub Copilot、xAI、Bing（含微软 Copilot） | AI |
| 5 | civitai.delivery、r2.cloudflarestorage.com | R2直连加速，默认 DIRECT |
| 6 | Civitai 主站/镜像/关键字、对象存储、HF/Xet、GitHub 资源、PyTorch、Lykos | 模型下载 |
| 7 | StabilityMatrix.exe / StabilityMatrix 进程兜底 | 模型下载 |
| 8 | Holodex/YouTube、Google FCM/Google、Telegram/Twitter；Spotify | 视频、谷歌、社媒；Spotify 进入国际媒体 |
| 9 | Developer、GitHub 页面、国际媒体；微软/OneDrive、苹果 | 对应业务组；微软和苹果进入全球直连（更早 AI/Developer 等规则优先） |
| 10 | 上游 Tencent（含微信）、个人 Direct/Proxy 剩余例外；GFW 泛代理 | 个人意图及普通代理 |
| 11 | ChinaDomain、ChinaCompanyIp、Download、GEOIP CN no-resolve | 全球直连 |
| 12 | FINAL | 漏网之鱼 |

共享挑战域名现在显式走普通节点选择。只删除旧规则，会被当前 ProxyMedia.list 归入国际媒体，并不会自然进入 ProxyGFWlist 的节点选择。它无法自动跟随发起页面的业务组；遇到 Civitai/AI 验证问题，要让普通节点选择与当前网站使用的业务组选择相容的稳定出口，再检查站点日志。不能仅凭路由表断言出口不同必然导致所有 Turnstile 验证无限循环。

ProxyGFWlist 特意放在各业务列表之后，否则会提前抢走 Netflix、Google、GitHub 等域名。Download 始终位于模型/进程规则之后。局域网位于进程兜底之前，保证 StabilityMatrix → localhost/ComfyUI/WebUI 的连接直连。

GitHub 的分离是按**目标域名**完成：github.com 普通页面走节点选择；githubusercontent.com、githubassets.com 走模型下载。它不能判断内容大小，CSS、小型 Raw 文件也会随其域名进入模型组。Release、LFS 和 HF 302 跳转仍可能使用新主机，应从实际连接日志核实，不能承诺所有未来 CDN 自动正确识别。

## AI 与模型节点隔离

AI 默认美国，候选为美、日、新、台和一个 AI 安全手动入口。不再复制 AI 优选、AI 自动、AI 故障转移等底层组，也不引用包含香港的普通节点选择/手动/故障转移池。

订阅全部是 Cloudflare 搭建，因此“优选与自建”没有区分作用，已全部移除。普通业务与模型共用一个 `🔄 故障转移` 池；不能凭“CF/优选”的名字认定某节点性能更好。面板最前依次是普通手动、油管、谷歌、AI、AI手动、模型下载、R2、节点选择；次要业务随后，地区与测速池沉底。总计 20 组，AI 专用分组只保留业务入口和安全手动入口。

普通/模型池及香港组排除英国；美/日/新/台和 AI 手动池额外排除香港。检测 UK/GB/London、中文、国旗及沪英/深英等转发标签，也支持“自建HK01”这种中文连写的标签。正则使用 ASCII 字母数字边界，避免 Unicode 单词边界或转换转义造成代码漏匹配。名字过滤仍不能证明真实出口国家，应验证实际 egress。

SEA 按你的确认默认美国，未放进新加坡。美国补齐圣何塞、硅谷、达拉斯、芝加哥、波特兰、凤凰城、亚特兰大、纽约及 SJC/DFW/ORD/PDX/PHX/ATL 等；日本增加 TYO/埼玉/沪日/深日，台湾增加台北/新北/彰化。五个地区组共享使用，无英国和其他冷门地区组。

地区 url-test 为 300 秒，亚太容差 50ms，美国 100ms；通用 fallback 为 120 秒。测试地址按照规划使用 `http://www.gstatic.com/generate_204`。测通该地址只证明探测连接，不代表 AI 可用、流媒体解锁或大文件传输无故障。

测速组不再直接混入 REJECT。INI 中美/日/新/台回退 AI 手动池，香港及全量自动回退普通手动池。REJECT 保留在底层手动池或作为原生空池拒绝策略，不以 DIRECT 破坏 AI 隔离。

配套脚本对静态节点：该地区有实际节点时移除手动测速候选，缺地区时保留手动回退。对动态 provider：扩展运行时不知道 provider 更新后的节点集合，保留安全手动候选，因此它会参与测速，可能选择另一允许地区。地区名此时不是唯一出口地区保证；需要锁美区时直接选已验证的美国节点。

Mihomo v1.19.32 禁止 empty-fallback 指向策略组，不能填写“AI手动切换”来实现只在空池时跳组。脚本对 provider 手动池移除作为常驻候选的 REJECT，并使用合法的 empty-fallback:REJECT，保证有可用节点时不会默认停在拒绝。所有安全池都空/失效时仍应拒绝，而不是承诺“绝不断网”或回退受限节点。

url-test/fallback 可能在新连接上切换出口。已有 TCP 连接不能无缝迁移到另一节点；120 秒探测也不能自动恢复过期签名 URL。账号登录与长下载需要稳定出口时，直接选固定真实节点，并由应用执行续传/重试。更大的容差只减少因延迟波动切换的概率。

## Civitai：鉴权与传输分离

网页、API、图片、302 签名获取及 Civitai.red/.tv/.link 等按需求进入模型组。R2 两条规则提前匹配，默认直连。`civitai` 关键字用于新后缀兜底，但也可能匹配无关名称；这只是路由兜底，不是域名所有权验证。

digitaloceanspaces.com、backblazeb2.com 是共享对象存储后缀，r2.cloudflarestorage.com 也是共享后缀。按需求纳入的规则会影响这些后缀的所有租户，并非仅 Civitai。若日志能确认完整的模型文件主机名，可用精确 DOMAIN 规则缩小范围；不要凭空编造 bucket 名。

HF、Civitai、GitHub 资源、PyTorch、Lykos 和 StabilityMatrix 进程规则统一放进 ModelDownload.list，INI 只引用一次。hf.co 已覆盖 xethub.hf.co，不重复列子域；进程兜底放列表最后。R2Direct.list 单独列在模型列表之前，因为它使用不同策略，不能将两者混成一份不带策略的规则清单。没有引用并不存在的上游 HuggingFace.list。

R2 直连不经自建 Workers 节点，可减少代理链中的一个故障环节，但本地运营商连通、源站限流、TLS、签名有效期与应用续传行为仍会影响下载。R2直连加速策略可随时切换通用故障转移/主力地区以对比。

Cloudflare 文档的 128MB 是 isolate 内存限额；推荐流式传输以免整份响应缓冲超过限额，不能推断“所有数 GB 下载必然被 128MB 限制掐断”。文档说明 HTTP 触发请求没有固定硬时长上限，同时平台更新可能让已有连接在一定时间后结束。StabilityMatrix 当前源码已有 Range 请求、续传和重试，不能未经复现把其 .NET HttpClient 定性为断流根因。

## DNS、Hosts、Fake-IP 与底层参数

覆写启用 strict 进程查找、TCP concurrent、unified-delay，keep-alive-idle/interval 均为 15 秒。TCP concurrent 主要影响多地址连接竞争，不等于增加网页应用的下载并发；保活不能修复源站关闭、代理限流或签名失效。

`dns.use-hosts` 和 `dns.use-system-hosts` 开启；注意 use-system-hosts 应位于 DNS 对象内。Hosts 默认空，**没有把 104.18.32.47 / 172.64.155.209 当成当前可用的 Civitai IP 强制绑定**。如自行完成测速及 TLS/HTTP/Range 检查，可按下面格式合并自己的结果：

```yaml
hosts:
  civitai.delivery: 104.18.32.47 # 仅示例；先换成你已经验证的 IP
```

原域名、TLS SNI、证书与签名 URL 的 Host 必须保持正确。验证时使用实际下载路径/有效签名，检查分块与 Range 是否返回预期的 206；仅测 IP 延迟不够。Cloudflare Anycast 地址可达不代表服务当前允许在该地址访问，也不保证长期稳定或“满速零中断”。不要给所有 R2 租户统一固定一对示例 IP。

Fake-IP 模式下，Civitai/HF/Xet/GitHub 资源/PyTorch 域名按规划豁免，返回真实 IP；也加入 civitai.link 豁免，帮助其本地用途先匹配局域网。开启 store-fake-ip 有助于保存映射。这些是兼容与诊断选择，不是已经证明 Fake-IP 映射会定时刷新并导致所有续传失败。

普通 DNS 使用国内 DoH；AI 与模型关键域名通过对应策略的 1.1.1.1 DoH 解析，R2 使用国内 DoH 便于直连调度；节点域名有独立的国内 DoH 引导解析。默认 DNS 仍可能观察未单独指定的域名，不宣称“零泄漏”。TUN 的 UDP/53 劫持也不保证捕获浏览器或应用自带 DoH。

Sniffer 启用 parse-pure-ip，HTTP 覆盖 80、8080-8880，TLS/QUIC 覆盖 443/8443，并在全局和各协议明确设置 override-destination:false。嗅探能补充部分缺失域名，但加密 ECH、某些 QUIC 或非支持协议可能无法识别；不会强行覆盖已指定的目标/Hosts。

## 自建 CF 节点设置：在订阅源完成

按当前讨论采用普通 WebSocket、不主动启用 sing-mux 的保守基线。已核实源头是 cmliu/edgetunnel，关闭面板的“启用0-RTT(ed=2560)”并检查 PATH 内没有手工残留的 ed 参数；原路径中的鉴权、proxyip 等其他内容必须保留。具体操作和单节点检查见 [EdgeTunnel_Setup.md](EdgeTunnel_Setup.md)。

新版配套 JS 已移除按名称识别 CF、自建、clone 并改写节点的逻辑，所有节点字段原样保留，适用于名称为 civitai1 等场景，也避免误以为它能改写远程 provider。AI 规则前置和缺地区回退仍保留。历史文件名 node_tuning.js 为兼容已有链接暂不改名。

当前源代码生成的普通 VLESS/Trojan URI 没有主动启用 Mihomo sing-mux；没有 smux 配置不等于必须补一份强制关闭脚本。若实际转换结果出现 smux.enabled:true，需在转换源或后端修正，当前 INI 没有通用的批量节点字段覆写功能。SS/v2ray-plugin 的 mux 与 sing-mux 不是同一字段，应另行检查，不能套用 VLESS 步骤。

这不是保证修复 EOF、502、Codex 断连或下载中断的方案。客户端不再重写传输字段不等于已经替用户关闭面板开关；需完成源头操作并重新获取订阅。尚未访问用户部署或测试真实节点。

## 个人规则保留与误杀审查

原 `rule/Ai.list`、`Google Gemini.list`、`WeChat.list`、`civitai.list`、`direct.list`、`google.list`、`spotify.list`、`twitter.list`、`vpn.list` 均原样留存。新模板不再引用这些文件，也不再引用旧的 rule/Personal_Advanced 快照；旧路径仍在 GitHub 保留，兼容尚未更新的订阅。

通用 AI/Google/Spotify/Twitter/微信业务改由上游承接，不能保证与每一条旧个人规则逐字等价：旧 AI 中的共享 auth0/statsig、过宽 Google 关键字和固定服务 IP 不再沿用。x.com 使用社媒线路；国内 AI 保留 Direct 例外；模型规则统一到 ModelDownload。Direct 合并原 direct 与上游尚未覆盖的微信域名，Proxy 继承 vpn 中的个性化站点。已被更早业务规则覆盖的个人重复条目从新列表移除，sources.json 的 personal_coverage 记录具体来源和目标组。原始文件不被改写。

AI 使用 MetaCubeX 的细分 geosite classical 清单，而非 category-ai-!cn：后者包含 Hugging Face，会抢占模型下载线路。六份 AI 清单在此次审查中均为域名规则，没有 ASN/CIDR，不把整个共享支付、证书或 Cloudflare 网络送到 AI；OpenAI 清单仍含精确的 Datadog 遥测主机及 LiveKit 子域，可能影响同一精确主机的其他使用方。Bing 清单会将 Bing 搜索与微软 Copilot 一并交给 AI，不是仅识别对话请求。

微信由 MetaCubeX tencent 域名清单与个人剩余例外承接，范围包含其他腾讯服务。未采用 blackmatrix7 WeChat 中的腾讯 ASN 132203，以免新增 ASN 数据库依赖和按整段网络分流。广告仍只加载 BanProgramAD、BanAD；“轻量”不等于不会误杀，有问题先将广告组切为 DIRECT 并核对具体命中项。

没有启用全局 Cloudflare CIDR、ASN 或 `GEOIP,cloudflare`。这类规则既可能影响不相关的共享 CDN，也可能要求当前 MMDB 不存在的 GeoIP 分类。自己的 CF 节点通过名称选择，与目标网站的 Cloudflare IP 网段分流是两件事。

## 更新、回滚和测试边界

公共 URL 现在跟踪 MetaCubeX 的 meta 分支，以及 ACL4SSR、blackmatrix7 的 master 分支。上游仓库最近提交分别为 2026-10-14、2026-10-07、2026-10-13（UTC）；仓库近期有提交不代表每个业务清单每天变化。本次逐个下载核实 29 条公共引用，来源表同时保存审查提交 URL 和字节哈希。

自动获取新规则发生在刷新转换缓存并重新转换订阅时；既有 YAML 不会因上游提交自行更新。这提高更新便利性，也意味着未来规则内容可能变化。本次测试只覆盖记录的快照；需要完全可复现时，将来源表中的 audited_url 固定提交地址替换回 INI。公共转换器仍能看到订阅 URL，建议本地转换。

MetaCubeX OpenAI 清单含 DOMAIN-REGEX，本次已确认 Extended v1.9.14 转换逐条保留、Mihomo v1.19.32 可解析。旧版 Subconverter 或第三方转换站是否支持不能据此保证，导入前核对输出，不能静默忽略未知规则。切换主流源不能保证永不误分流，规则顺序和最终运行配置仍需核对。

修改 INI、底稿或列表后，需要刷新转换器缓存并重新转换，不能只重载已生成的旧 YAML。遇到问题可切回原订阅/旧配置或移除新增的覆写与脚本，原规则文件没有被替换。

已完成：实际 Extended 转换、规则顺序对照、策略/DNS 引用检查、AI/模型全链路候选隔离、35 个域名/进程/回环样例、转换 YAML + 合并 override + 源节点字段保留输出 + 缺地区样例的 Mihomo -t。节点调优 JS 在 Node vm 中运行并检查输出，未在实际 Verge UI 内执行。

没有真实机场凭据。使用的节点为 127.0.0.1:9 占位，未发出真实代理流量。此前 5386ff4 版本已通过本机核心 API 检查动态 provider 成员、SEA 归属、AI/模型隔离和缺地区回退；本机 HTTP 对照测试中 REJECT 返回测速失败，DIRECT 测得 1ms。这不是真实节点的延迟测量。

未验证真实服务支持地区、网站访问、R2 直连速度、断点续传、Hosts IP、DNS 出口、实际 TUN 或路由器配置。

本地验收建议：

1. 检查最终组成员与节点真实出口；故意隐藏/错误标记地区不能靠正则消除。
2. 分别测试 AI 登录/API、Gemini AI Studio、Civitai 鉴权及 302 后的实体下载；观察匹配组与实际重定向主机。
3. StabilityMatrix 的本地 WebUI 必须直连；系统代理不生效时启用 TUN，再确认进程规则命中。
4. 用有效下载链接分别测 R2 DIRECT 与代理，对比 Range、ETag、Content-Length、续传和最终文件校验，不只测测速地址。
5. 另行验证 Hosts 绑定；比较开启/关闭 Fake-IP 豁免、sniffer、Early Data，复现后再判断断流根因。
6. 测微信、国内 AI、NAS、qBittorrent、Google、Holodex、4K 视频与 Spotify；误杀从具体规则排查。
7. 检查 IPv6、应用自带 DoH、VPN/WSL/虚拟网卡和 TUN 开关；不要用配置 -t 代替联网验收。



## 手动入口与常用业务顺序

面板卡片顺序为：**普通手动 → 油管 → 谷歌 → AI → AI手动 → 模型下载 → R2 → 节点选择**。这是线性声明顺序；实际每行列数由客户端窗口宽度决定。

主要业务组里的手动选项移到第二位，首位默认值保持原状：视频默认节点选择、谷歌/AI 默认美国、模型默认故障转移、R2 默认 DIRECT。AI 的第二项仍是过滤后的 AI 手动池，不接入普通手动池。

配套 JS 从 2026-10-15 起不再强制重排面板和业务 select 候选：排序由 INI 决定，避免自定义行序被脚本覆盖。必须同时更新 INI 和脚本并重新转换；仅更新脚本不会删除旧 YAML 中的三个服务组。脚本仍处理缺地区回退、provider 手动池 REJECT 常驻项和 AI 核心域名保障。已存选择可能按原组名保留，因此候选第一项是首次默认值，不一定覆盖你之前保存的选择。

值得继续优化的项目：

- **固定 AI/下载出口**：AI 登录和长下载优先选稳定节点，视频可以使用自动或故障转移。测速延迟不代表实际视频/模型传输速度。
- **认识共享手动入口**：油管、谷歌、模型若都选普通手动，修改手动节点会一起影响它们。需要独立时可给对应业务组增加直接选节点的能力，优先复用现有池，不再复制大量底层分组。
- **保留少量诊断开关**：R2 默认 DIRECT；下载失败时仅切换 R2 组对比代理，验证问题先核对普通总控与当前网站的出口，避免同时改 DNS/Hosts/节点而无法定位原因。

本次实际转换、核心检查及自定义排序保留测试通过，为 20 组、15,456 条转换规则（含四条 OpenAI 核心域名内联保障）。地区过滤保持不变。

### Codex / ChatGPT 误入国际媒体的修复

用户提供的连接是 `chatgpt.com:443`、进程 `codex.exe`，命中 `DomainSuffix(chatgpt.com)`，却进入国际媒体。当时的 AI.list 已收录该域名且按模板应先于媒体规则；上游 ProxyMedia.list 也包含 chatgpt.com。因此该链路与预期不符，但仅凭连接详情不能确定是转换缓存、AI 清单加载失败、后续扩展覆盖顺序，还是旧连接仍保留原路径。

INI 现在在远程 AI 清单前内联 `chatgpt.com`、`openai.com`、`oaistatic.com`、`oaiusercontent.com` 四个后缀。配套 JS 在存在 AI组时，将这四条规则移至规则表最前并去除相同保障规则的重复项；没有 AI 组则跳过，避免引用不存在的策略。脚本不将整个 codex.exe 或通用子进程强制分流。

更新并重新转换 INI（清理转换缓存），同时替换 Verge 订阅脚本；脚本需在其他会替换 rules 的扩展之后执行。检查最终运行配置前四条规则，再关闭旧的 Codex/chatgpt.com 连接或完全退出重启 Codex，观察新连接应经过 AI。只刷新配置不能保证既有长连接重新选路。无需修改 Token、Cookie 或登录配置。

已用“移除所有 AI 规则、将 chatgpt.com 媒体规则置首”的模拟配置验证四个域名恢复 AI 分流、其他媒体规则保留、脚本重复执行结果一致及无 AI 策略时跳过；修复后的 YAML 通过 Mihomo 配置检查。未操作用户当前客户端，未测试真实机场或 OpenAI 联网。

## 对外部检查意见的审核

| 意见 | 核实结果与处理 |
|---|---|
| 共享挑战域名绑死 AI | 设计不合适，已改普通节点选择；不能把每次 Civitai 验证失败归因于这一条规则。Cloudflare Siteverify 的 remoteip 是可选参数，不支持“所有站点一律强制两次请求 IP 相等”的绝对断言 |
| REJECT 有时作为正常 0ms 节点胜出 | 当前核心的本机对照测试未复现：REJECT 测速失败（HTTP 503），正常连接为 1ms。URL-test 根据存活/延迟信息选择；只有拒绝策略可用时拒绝流量本就是预期。改为安全手动回退改善缺地区体验，但不保证真实节点全坏时不断网 |
| SEA 移到新加坡 | 不采用，你已确认默认美国。实际 fixture 使用反代IP-SEA-21.03M-clone，核心确认在美国候选而不在新加坡候选 |
| 面板业务组应在前 | 已调整；普通手动和四项高频业务靠前，原始 INI 的前向引用也通过转换验证 |
| daily-cloudcode-pa.googleapis.com | 已由上游 google-gemini.list 覆盖；AI 规则仍先于 Google |
| 重复 HF/Civitai 引用 | 现统一为一条 ModelDownload.list 引用，内部覆盖 HF/Civitai/资源/进程；R2Direct 使用独立策略并优先匹配。旧文件留存兼容 |
| git/python/aria2 进程 | 不全局绑到模型下载：进程名不能可靠判断是不是 StabilityMatrix 派生任务，会误接管无关 Git、Python、aria2 流量。保留现有域名覆盖及 StabilityMatrix 进程兜底，新增进程应有实际日志依据 |
| 美国词库、冗余正则 | 已补齐城市/机场代码，并简化全量池匹配。用户粘贴代码中的 Markdown 转义和 `\vert{}` 未原样写入配置 |
| Commit SHA 完全防投毒 | 锁定版本能减少上游漂移，不证明锁定内容本身可信，也不保证未来托管可访问；本仓库 main 仍可更新，需要继续审查 |

底稿已含 fake-ip-filter、sniffer、keep-alive 等；Hosts 优选 IP 仍只作为未启用的示例，没有将未经本地测试的地址固定写入。

参考：[Turnstile 服务端验证](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)，[Mihomo v1.19.32 分组解析](https://github.com/MetaCubeX/mihomo/blob/v1.19.32/adapter/outboundgroup/parser.go)。

## 参考依据

- [Aethersailor Custom_OpenClash_Rules](https://github.com/Aethersailor/Custom_OpenClash_Rules)：架构参考，其路由器配套设置不能直接等同 Verge 桌面设置。
- [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7](https://github.com/blackmatrix7/ios_rule_script)：精确规则文件及提交见 sources.json。
- [Mihomo DNS](https://wiki.metacubex.one/config/dns/)、[官方配置样例](https://github.com/MetaCubeX/mihomo/blob/Meta/docs/config.yaml)。
- [Cloudflare Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)、[可读取的文档源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/limits.mdx)：本次通过文档源码核实内存/流式处理/时长说明。
- [HF 下载](https://huggingface.co/docs/huggingface_hub/guides/download)、[HF 存储后端](https://huggingface.co/docs/hub/storage-backends)。
- [StabilityMatrix DownloadService](https://github.com/LykosAI/StabilityMatrix/blob/main/StabilityMatrix.Core/Services/DownloadService.cs)：当前 Range/重试逻辑参考。

## 当前维护入口

| 内容 | 修改位置 | INI 引用数 |
|---|---|---|
| Civitai、HF/Xet、代码资源、PyTorch、StabilityMatrix | [ModelDownload.list](../rule/Personal/ModelDownload.list) | 1 |
| 实体 R2 下载，默认直连 | [R2Direct.list](../rule/Personal/R2Direct.list) | 1 |
| 国内 AI、NAS、下载器等直连例外 | [Direct.list](../rule/Personal/Direct.list) | 1 |
| 其他个人代理站点 | [Proxy.list](../rule/Personal/Proxy.list) | 1 |

通用业务直接修改上游选型或更新转换结果，无需在本仓库维护 Google、Spotify、Twitter、AI 的复制品。Holodex 仅保留一条内联规则，避免为单个域名再建一个文件。四条 OpenAI 内联规则和脚本前置保障继续保留，用于远程 AI 清单加载异常时的核心域名回退。

总计 41 条 ruleset 声明、20 个策略组；本次快照转换后 15,456 条规则。条目总数会随上游分支更新而变化。四份个人列表使用标准无策略列 .list 格式，不能将不同目标策略随意合并成一个文件。

## 微软、苹果、Spotify 与自定义排序（2026-10-15）

微软和苹果的独立组原本都默认全球直连；在没有经常单独切换出口的需求时，保留独立卡片价值有限。新版本删除这两个业务组，公共 OneDrive/Microsoft/Apple 规则依然保留，统一指向全球直连。更早的 AI、模型、Developer 等规则仍优先匹配：微软 Copilot 继续走 AI，部分 Apple Developer 域名仍可能走开发者代理。常规直连可用性取决于本地网络，不保证所有海外接口或 OneDrive 大文件同样顺畅；若仅某域名有问题，应在泛直连规则前增加该域名的节点选择例外，避免为它切换整个全球直连组。

Spotify 清单继续直接引用 blackmatrix7，目标改为国际媒体，删除独立 Spotify 卡片。Spotify 和其他国际媒体会共享该业务组当前选择，无法继续分别保存业务出口；如需不同地区再恢复独立业务组。

自定义排列的三个层次：

1. 移动完整 `custom_proxy_group=` 行：改变配置中的组显示顺序，不改变域名分流和策略引用；允许先引用后声明组，已通过转换检查。客户端自己的排序选项、显示模式或其他扩展仍可能影响最终面板。
2. 调整同一 select 行内的候选：改变候选显示顺序和首次默认项。保留 AI 组的隔离关系；不要把普通手动、香港或普通节点选择加入 AI 候选。fallback 的成员顺序影响故障转移优先级，也不只是显示调整。
3. 调整 `ruleset=` 行：改变实际匹配优先级，不能按面板喜好随意移动。AI 必须先于通用 Google/媒体，R2 必须先于模型域名/进程规则，国内泛直连和 FINAL 保持末尾。

修改组名需同步所有候选、ruleset、DNS policy 和脚本引用，单纯移动行无需改名。脚本已验证保留逆序面板和自定义业务候选顺序；底层手动 provider 池的 REJECT 处理及测速池回退仍是必要的语义调整。

当前建议保持二十组结构，不增加负载均衡池。Holodex 与 YouTube 共用视频组；AI 和模型下载优先固定稳定出口。普通手动池同时被油管、谷歌、模型引用时，修改该池选中节点会同时影响这些业务；需要独立出口时先在各业务组选择不同地区或直接挂载已验证节点，不必复制一套自动池。

此次保留 GitHub 上已作的组名简化“🤖 AI”，并同步 base.yaml、override.yaml 的 DNS policy 与 JS 核心域名保障。改名会使旧组名保存的选择不能直接复用，更新后请核对 AI 当前选中节点。

模型下载组现在直接列出节点名含 civitai 的订阅节点，大小写不敏感，例如 civitai1、civitai2、CIVITAI US01。仍按原有正则排除英国名称标签，香港允许用于模型下载。原故障转移默认项、手动入口和地区候选保留，匹配节点追加为可直接选择的候选，不会仅因名称匹配自动改选；名称也不代表速度或真实出口。无匹配节点时原候选继续可用，不新增分组。已用名称样例、空匹配订阅及 Mihomo 检查验证。

INI 注释现按实际用途分成十段：本地连接和网站验证、拦截广告、AI 服务、下载模型、看直播/谷歌/聊天/音乐、开发网站和其他国外视频、通常直接连接的服务、其他需要代理的网站、国内网站和国内 IP、最后剩下的连接。每段说明它处理什么；只改变注释与空行，已逐行核对所有配置项、规则和策略组及其顺序完全一致。
