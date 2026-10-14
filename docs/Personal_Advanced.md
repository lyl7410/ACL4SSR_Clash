# Clash 个人高阶分流与大文件下载配置

版本：2026-10-14，常用业务与手动入口优先版。面向 Clash Verge Rev / Mihomo，采用服务分组、地区自动选择与一个共享故障转移池，使用已核实的 ACL4SSR、blackmatrix7 规则和本仓库个人规则。实际语法验证核心：Mihomo v1.19.32；实际转换器：SubConverter-Extended v1.9.14。

## 文件入口

- [Personal_Advanced.ini](../Clash/config/Personal_Advanced.ini)：订阅转换模板。
- [Personal_Advanced_override.yaml](../Clash/config/Personal_Advanced_override.yaml)：Mihomo YAML 覆写片段，含 DNS、Fake-IP 豁免、保活和嗅探。
- [Personal_Advanced_base.yaml](../Clash/config/Personal_Advanced_base.yaml)：转换底稿，已包含覆写参数；INI 的 clash_rule_base 使用它。
- [Personal_Advanced_node_tuning.js](../Clash/config/Personal_Advanced_node_tuning.js)：Verge 订阅脚本，用于转换结果中的自建 CF 节点，处理缺地区回退并关闭自建节点 smux / WebSocket Early Data。
- [Personal_Advanced_sources.json](Personal_Advanced_sources.json)：真实来源 URL、固定提交、SHA-256、规则变更、分组与顺序。
- [Personal_Advanced_validation.json](Personal_Advanced_validation.json)：本地解析、实际转换、分组隔离与路由检查结果。
- [rule/Personal_Advanced/](../rule/Personal_Advanced/)：可审查的个人修复列表及 AI/Hugging Face 聚合列表。

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
2. 转换接口参数为 `target=clash`、`url=<机场订阅 URL>`、`config=<INI 直链>`；参数要 URL 编码。转换器还必须能下载 INI 引用的基础 YAML、个人列表和固定提交的公共列表。
3. 将转换后的 YAML 导入 Clash Verge Rev。首次确认 `🤖 AI 专线` 默认美国、`⚡ R2直连加速` 默认 DIRECT、`📦 模型下载` 默认通用故障转移。
4. 转换结果已经通过 base.yaml 带上 override 参数。如果客户端会重写 DNS 等字段，或使用自己的转换底稿，在该订阅的 **YAML 合并/覆写编辑器** 应用 override.yaml，并检查最终运行配置。不要把 YAML 粘贴到 JavaScript 脚本编辑器。
5. 将 node_tuning.js 放入该订阅的 **JavaScript 脚本扩展**。它处理地区回退以及 provider 手动池的空池行为；传输参数调优只作用于 `proxies` 中按名称识别的自建节点。provider 内的节点传输参数需要在节点源或订阅预处理中修改。
6. 先测试系统代理，再在 Verge 中以必要的服务/管理员权限启用 TUN。底稿默认 TUN 关闭；单纯设置进程规则不代表应用所有流量已被接管。

Clash Verge Rev 的编辑器名称随版本不同。YAML 片段走 Merge，`function main(config)` 代码走 Script。出现脚本错误时，客户端可能沿用旧配置，必须核对最终配置及日志。OpenClash 应将字段合并进完整运行 YAML 或其相应自定义覆写机制，不能假定导入 INI 已设置路由器系统 DNS、透明代理或权限。

若自定义使用一个只含节点/provider 的原生 Mihomo 配置，须另行加入本方案策略组与规则；override.yaml 本身不提供这些字段。DNS policy 引用本方案业务组，因此不能随意搭配不同组名的配置。

## 规则顺序与业务分流

| 顺序 | 内容 | 策略 |
|---|---|---|
| 1 | LocalAreaNetwork、UnBan | 全球直连 |
| 2 | 精确 challenges.cloudflare.com 兼容规则 | 普通节点选择，避免强绑 AI 组及被其他列表提前捕获 |
| 3 | BanProgramAD、BanAD | 广告拦截，默认 REJECT |
| 4 | 聚合 AI：个人 AI/Gemini 与审查后的 OpenAI/Gemini/Claude/Copilot | AI 专线 |
| 5 | civitai.delivery、r2.cloudflarestorage.com | R2直连加速，默认 DIRECT |
| 6 | Civitai 主站/镜像/关键字、对象存储、HF/Xet、GitHub 资源、PyTorch、Lykos | 模型下载 |
| 7 | StabilityMatrix.exe / StabilityMatrix 进程兜底 | 模型下载 |
| 8 | Holodex/YouTube、Google FCM/Google、Telegram/Twitter-X、个人 Spotify | 各自业务组 |
| 9 | Developer、GitHub 页面、国际媒体、微软/OneDrive、苹果 | 对应业务组 |
| 10 | 个人 WeChat/direct/vpn；GFW 泛代理 | 个人意图及普通代理 |
| 11 | ChinaDomain、ChinaCompanyIp、Download、GEOIP CN no-resolve | 全球直连 |
| 12 | FINAL | 漏网之鱼 |

共享挑战域名现在显式走普通节点选择。只删除旧规则，会被当前 ProxyMedia.list 归入国际媒体，并不会自然进入 ProxyGFWlist 的节点选择。它无法自动跟随发起页面的业务组；遇到 Civitai/AI 验证问题，要让普通节点选择与当前网站使用的业务组选择相容的稳定出口，再检查站点日志。不能仅凭路由表断言出口不同必然导致所有 Turnstile 验证无限循环。

ProxyGFWlist 特意放在各业务列表之后，否则会提前抢走 Netflix、Google、GitHub 等域名。Download 始终位于模型/进程规则之后。局域网位于进程兜底之前，保证 StabilityMatrix → localhost/ComfyUI/WebUI 的连接直连。

GitHub 的分离是按**目标域名**完成：github.com 普通页面走节点选择；githubusercontent.com、githubassets.com 走模型下载。它不能判断内容大小，CSS、小型 Raw 文件也会随其域名进入模型组。Release、LFS 和 HF 302 跳转仍可能使用新主机，应从实际连接日志核实，不能承诺所有未来 CDN 自动正确识别。

## AI 与模型节点隔离

AI 默认美国，候选为美、日、新、台和一个 AI 安全手动入口。不再复制 AI 优选、AI 自动、AI 故障转移等底层组，也不引用包含香港的普通节点选择/手动/故障转移池。

订阅全部是 Cloudflare 搭建，因此“优选与自建”没有区分作用，已全部移除。普通业务与模型共用一个 `🔄 故障转移` 池；不能凭“CF/优选”的名字认定某节点性能更好。面板最前依次是普通手动、油管、谷歌、AI、AI手动、模型下载、R2、节点选择；次要业务随后，地区与测速池沉底。总计 23 组，AI 专用分组只保留业务入口和安全手动入口。

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

HF 规则涵盖 huggingface.co、hf.co、hf.space、xethub.hf.co。主 hf.co 后缀已经覆盖 Xet 子域，明确保留 Xet 条目方便维护。blackmatrix7 仓库当前不存在规划中写的 HuggingFace.list 路径，因此本仓库新建明确标记的 HF 列表；AI.list 也由真实个人及已核实 AI 列表合并。没有引用不存在的上游路径。

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

## 自建 CF 节点调优

本文件脚本先处理回退与手动池，再处理节点传输参数。静态 override.yaml 无法在不知道真实节点列表时，按名称修改每个节点的 ws path 或 smux。配套 JS 对 literal proxies 中名称包含反代/自建/CF/Cloudflare/clone，且类型为 vmess/vless/trojan/ss 的节点处理：

- 设置 `smux.enabled:false`；Mihomo 节点使用该语法，不能随意加入通用 `mux:false` 并假定生效。
- 从 ws-opts.path 仅删除 ed 查询参数，保留 token 等其他参数；将 max-early-data 设为 0 并移除 early-data-header-name。
- 不改变普通机场节点；只有“优选”名称而无自建/CF 标记的节点也不自动改动。

如果你的自建服务依赖 Early Data 或多路复用，应先确认服务端支持关闭，再做 A/B 下载比较。这份配置按个人请求默认对匹配的自建节点关闭相关功能，不能据此证明 Early Data 导致“乱序崩溃”。provider 节点需在其源配置修正，不能声称此脚本已经修改远程 provider 内的未知节点。

## 个人规则保留与误杀审查

原 `rule/Ai.list`、`Google Gemini.list`、`WeChat.list`、`civitai.list`、`direct.list`、`google.list`、`spotify.list`、`twitter.list`、`vpn.list` 均保持原样。新修复副本位于 Personal_Advanced 子目录，旧文件可继续追溯。

保留此前已审查的修复：粘连条目拆正、USER-AGENT 归档、atom.io/packages 修成域名、qbittorrent* 修成 Windows 进程名。Google Gemini 的泛 google keyword 与 AI 的整个 googleapis.com 规则由 Google 组承接；具体 Gemini API 优先。x.com 从 AI 转入社媒，避免将整个 X 当成 AI。

审查后的 AI 合并去重；没有把整个 ASN 20473/14061 或共享证书、支付、遥测域名当成 AI 专属。前次个人审查与本次 upstream AI 除外项均写入 sources.json。广告只加载指定两份基础列表，但“轻量”不等于不会误杀；有问题先切广告组为 DIRECT，再对照具体命中条目加精确例外。

没有启用全局 Cloudflare CIDR、ASN 或 `GEOIP,cloudflare`。这类规则既可能影响不相关的共享 CDN，也可能要求当前 MMDB 不存在的 GeoIP 分类。自己的 CF 节点通过名称选择，与目标网站的 Cloudflare IP 网段分流是两件事。

## 更新、回滚和测试边界

上游公共列表固定在此次核实的提交，来源表有完整 URL/哈希；个人聚合列表走本仓库 main。这样不会因未审查的上游改动直接改变分流。更新时先检查 source-manifest 中的来源，再修改聚合列表/固定提交并重新验证；只换上游版本号还需检查内容格式。

修改 INI、底稿或列表后，需要刷新转换器缓存并重新转换，不能只重载已生成的旧 YAML。遇到问题可切回原订阅/旧配置或移除新增的覆写与脚本，原规则文件没有被替换。

已完成：实际 Extended 转换、规则顺序对照、策略/DNS 引用检查、AI/模型全链路候选隔离、24 个域名/进程/回环样例、转换 YAML + 合并 override + 节点调优输出 + 缺地区样例的 Mihomo -t。节点调优 JS 在 Node vm 中运行并检查输出，未在实际 Verge UI 内执行。

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

配套 JS 除回退/节点调优外也统一卡片和候选顺序，旧转换结果应用新脚本后可以整理排列。建议同时更新 INI、重新转换并更新脚本，避免转换器或其他覆写保留旧顺序。脚本调整不重命名组；已存的节点选择通常继续按原组名保留，以客户端实际选择为准。

值得继续优化的项目：

- **固定 AI/下载出口**：AI 登录和长下载优先选稳定节点，视频可以使用自动或故障转移。测速延迟不代表实际视频/模型传输速度。
- **认识共享手动入口**：油管、谷歌、模型若都选普通手动，修改手动节点会一起影响它们。需要独立时可给对应业务组增加直接选节点的能力，优先复用现有池，不再复制大量底层分组。
- **保留少量诊断开关**：R2 默认 DIRECT；下载失败时仅切换 R2 组对比代理，验证问题先核对普通总控与当前网站的出口，避免同时改 DNS/Hosts/节点而无法定位原因。

本次实际转换、核心检查及旧缓存排列修复测试通过，为 23 组、14,829 条转换规则（含四条 OpenAI 核心域名内联保障）。地区过滤保持不变。

### Codex / ChatGPT 误入国际媒体的修复

用户提供的连接是 `chatgpt.com:443`、进程 `codex.exe`，命中 `DomainSuffix(chatgpt.com)`，却进入国际媒体。当前 AI.list 已收录该域名且按模板应先于媒体规则；固定的上游 ProxyMedia.list 也包含 chatgpt.com。因此该链路与预期不符，但仅凭连接详情不能确定是转换缓存、AI 清单加载失败、后续扩展覆盖顺序，还是旧连接仍保留原路径。

INI 现在在远程 AI 清单前内联 `chatgpt.com`、`openai.com`、`oaistatic.com`、`oaiusercontent.com` 四个后缀。配套 JS 在存在 AI 专线组时，将这四条规则移至规则表最前并去除相同保障规则的重复项；没有 AI 组则跳过，避免引用不存在的策略。脚本不将整个 codex.exe 或通用子进程强制分流。

更新并重新转换 INI（清理转换缓存），同时替换 Verge 订阅脚本；脚本需在其他会替换 rules 的扩展之后执行。检查最终运行配置前四条规则，再关闭旧的 Codex/chatgpt.com 连接或完全退出重启 Codex，观察新连接应经过 AI 专线。只刷新配置不能保证既有长连接重新选路。无需修改 Token、Cookie 或登录配置。

已用“移除所有 AI 规则、将 chatgpt.com 媒体规则置首”的模拟配置验证四个域名恢复 AI 分流、其他媒体规则保留、脚本重复执行结果一致及无 AI 策略时跳过；修复后的 YAML 通过 Mihomo 配置检查。未操作用户当前客户端，未测试真实机场或 OpenAI 联网。

## 对外部检查意见的审核

| 意见 | 核实结果与处理 |
|---|---|
| 共享挑战域名绑死 AI | 设计不合适，已改普通节点选择；不能把每次 Civitai 验证失败归因于这一条规则。Cloudflare Siteverify 的 remoteip 是可选参数，不支持“所有站点一律强制两次请求 IP 相等”的绝对断言 |
| REJECT 有时作为正常 0ms 节点胜出 | 当前核心的本机对照测试未复现：REJECT 测速失败（HTTP 503），正常连接为 1ms。URL-test 根据存活/延迟信息选择；只有拒绝策略可用时拒绝流量本就是预期。改为安全手动回退改善缺地区体验，但不保证真实节点全坏时不断网 |
| SEA 移到新加坡 | 不采用，你已确认默认美国。实际 fixture 使用反代IP-SEA-21.03M-clone，核心确认在美国候选而不在新加坡候选 |
| 面板业务组应在前 | 已调整；普通手动和四项高频业务靠前，原始 INI 的前向引用也通过转换验证 |
| daily-cloudcode-pa.googleapis.com | 已加入聚合 AI.list，generativelanguage.googleapis.com 原已存在并保留；AI 规则仍先于 Google |
| 重复 HF/Civitai 引用 | HF 专用列表作为域名来源，移除重复内联四条；Civitai 规则内联保留，移除重复的远程单条列表引用。原文件仍留存 |
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
