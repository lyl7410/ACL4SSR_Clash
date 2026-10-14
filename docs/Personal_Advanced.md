# Clash 个人高阶分流与大文件下载配置

版本：2026-10-14。面向 Clash Verge Rev / Mihomo，沿用 Aethersailor 的服务分组、优选与地区自动选择思路，使用已核实的 ACL4SSR、blackmatrix7 规则和本仓库个人规则。实际语法验证核心：Mihomo v1.19.32；实际转换器：SubConverter-Extended v1.9.14。

## 文件入口

- [Personal_Advanced.ini](../Clash/config/Personal_Advanced.ini)：订阅转换模板。
- [Personal_Advanced_override.yaml](../Clash/config/Personal_Advanced_override.yaml)：Mihomo YAML 覆写片段，含 DNS、Fake-IP 豁免、保活和嗅探。
- [Personal_Advanced_base.yaml](../Clash/config/Personal_Advanced_base.yaml)：转换底稿，已包含覆写参数；INI 的 clash_rule_base 使用它。
- [Personal_Advanced_node_tuning.js](../Clash/config/Personal_Advanced_node_tuning.js)：Verge 订阅脚本，用于转换结果中的自建 CF 节点，关闭 smux / WebSocket Early Data。
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
3. 将转换后的 YAML 导入 Clash Verge Rev。首次确认 `🤖 AI 专线` 默认美国、`⚡ R2直连加速` 默认 DIRECT、`📦 模型下载` 默认优选故障转移。
4. 转换结果已经通过 base.yaml 带上 override 参数。如果客户端会重写 DNS 等字段，或使用自己的转换底稿，在该订阅的 **YAML 合并/覆写编辑器** 应用 override.yaml，并检查最终运行配置。不要把 YAML 粘贴到 JavaScript 脚本编辑器。
5. 有自建 CF 节点时，将 node_tuning.js 放入该订阅的 **JavaScript 脚本扩展**。它只修改转换结果 `proxies` 中按名称识别的自建节点；纯远程 provider 内的节点不会被此脚本逐个改写，需要在节点源或订阅预处理中修改。
6. 先测试系统代理，再在 Verge 中以必要的服务/管理员权限启用 TUN。底稿默认 TUN 关闭；单纯设置进程规则不代表应用所有流量已被接管。

Clash Verge Rev 的编辑器名称随版本不同。YAML 片段走 Merge，`function main(config)` 代码走 Script。出现脚本错误时，客户端可能沿用旧配置，必须核对最终配置及日志。OpenClash 应将字段合并进完整运行 YAML 或其相应自定义覆写机制，不能假定导入 INI 已设置路由器系统 DNS、透明代理或权限。

若自定义使用一个只含节点/provider 的原生 Mihomo 配置，须另行加入本方案策略组与规则；override.yaml 本身不提供这些字段。DNS policy 引用本方案业务组，因此不能随意搭配不同组名的配置。

## 规则顺序与业务分流

| 顺序 | 内容 | 策略 |
|---|---|---|
| 1 | LocalAreaNetwork、UnBan | 全球直连 |
| 2 | 精确 challenges.cloudflare.com 兼容规则 | AI 专线，防挑战组件被广告规则拦截或走到受限池 |
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

精确挑战白名单在广告前是为了满足验证组件兼容要求；它属于共享域名，无法仅凭域名分辨来源网页。Civitai 挑战失败时，应让模型组和 AI 专线选择相容的稳定节点，再检查浏览器状态与挑战日志。

ProxyGFWlist 特意放在各业务列表之后，否则会提前抢走 Netflix、Google、GitHub 等域名。Download 始终位于模型/进程规则之后。局域网位于进程兜底之前，保证 StabilityMatrix → localhost/ComfyUI/WebUI 的连接直连。

GitHub 的分离是按**目标域名**完成：github.com 普通页面走节点选择；githubusercontent.com、githubassets.com 走模型下载。它不能判断内容大小，CSS、小型 Raw 文件也会随其域名进入模型组。Release、LFS 和 HF 302 跳转仍可能使用新主机，应从实际连接日志核实，不能承诺所有未来 CDN 自动正确识别。

## AI 与模型节点隔离

AI 默认美国，候选顺序为美、日、新、台、AI 优选、AI 故障转移、AI 安全自动、AI 手动。它**不引用**普通节点选择、普通手动或普通优选，避免经嵌套组绕回香港/英国。

普通池、模型优选池和全部地区组排除英国；供 AI 使用的池与美/日/新/台地区组额外排除香港。香港组保留给模型、视频和普通业务。只有美、日、新、台、港五个地区组；Spotify 组保留是因为原个人 spotify.list 需要独立出口，未新增网易云、巴哈姆特、Sony、Epic、BBC 等业务组。

筛选包括 UK/GB、London、United Kingdom、英国、国旗及 HK/HKG/Hong Kong/香港等常见名称，也检查 UK01、混合“UK-日本”等标签。**名称过滤不能证明真实出口国家**，不准确或隐藏地区的自建节点仍需用户查实际 egress。排除英国是本次个人约束，不表示所有 AI 服务都不支持英国；支持地区随服务政策变化。

优选池匹配优选、反代、自建、CF、Cloudflare、clone、SEA、NRT、专线、IEPL、BGP、低倍率、0.1x、下载。删除了规划正则中的 `|.*`：否则所有节点都会匹配，优选池没有筛选作用。它没有额外的“优选一定快”保证。

SEA 通常是西雅图机场代码，因此归入美国及优选池；新加坡使用 SG/Singapore/SIN/中文名称。日本含 NRT/KIX，台湾含 TPE，香港含 HKG。若你的机场另有命名含义，应根据实际出口修订。

地区 url-test 为 300 秒，亚太容差 50ms，美国 100ms；优选 fallback 为 120 秒。测试地址按照规划使用 `http://www.gstatic.com/generate_204`。测通该地址只证明探测连接，不代表 AI 可用、流媒体解锁或大文件传输无故障。

池为空时以安全组或 REJECT 承接；缺少美国节点时 AI 默认美国组可能不可用，需要手动选日/新/台等已验证的安全候选。不会为了“自动恢复”偷偷回退香港、英国或 DIRECT。

url-test/fallback 可能在新连接上切换出口。已有 TCP 连接不能无缝迁移到另一节点；120 秒探测也不能自动恢复过期签名 URL。账号登录与长下载需要稳定出口时，直接选固定真实节点，并由应用执行续传/重试。更大的容差只减少因延迟波动切换的概率。

## Civitai：鉴权与传输分离

网页、API、图片、302 签名获取及 Civitai.red/.tv/.link 等按需求进入模型组。R2 两条规则提前匹配，默认直连。`civitai` 关键字用于新后缀兜底，但也可能匹配无关名称；这只是路由兜底，不是域名所有权验证。

digitaloceanspaces.com、backblazeb2.com 是共享对象存储后缀，r2.cloudflarestorage.com 也是共享后缀。按需求纳入的规则会影响这些后缀的所有租户，并非仅 Civitai。若日志能确认完整的模型文件主机名，可用精确 DOMAIN 规则缩小范围；不要凭空编造 bucket 名。

HF 规则涵盖 huggingface.co、hf.co、hf.space、xethub.hf.co。主 hf.co 后缀已经覆盖 Xet 子域，明确保留 Xet 条目方便维护。blackmatrix7 仓库当前不存在规划中写的 HuggingFace.list 路径，因此本仓库新建明确标记的 HF 列表；AI.list 也由真实个人及已核实 AI 列表合并。没有引用不存在的上游路径。

R2 直连不经自建 Workers 节点，可减少代理链中的一个故障环节，但本地运营商连通、源站限流、TLS、签名有效期与应用续传行为仍会影响下载。R2直连加速策略可随时切换优选故障转移/主力地区以对比。

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

静态 override.yaml 无法在不知道真实节点列表时，按名称修改每个节点的 ws path 或 smux。配套 JS 对 literal proxies 中名称包含反代/自建/CF/Cloudflare/clone，且类型为 vmess/vless/trojan/ss 的节点处理：

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

已完成：实际 Extended 转换、规则顺序对照、策略/DNS 引用检查、AI/模型全链路候选隔离、23 个域名/进程/回环样例、转换 YAML + 合并 override + 节点调优输出 + 缺地区样例的 Mihomo -t。节点调优 JS 在 Node vm 中运行并检查输出，未在实际 Verge UI 内执行。

没有真实机场凭据。使用的节点为 127.0.0.1:9 占位，未发出真实代理流量。未验证真实服务支持地区、网站访问、R2 直连速度、断点续传、Hosts IP、DNS 出口、实际 TUN 或路由器配置。

本地验收建议：

1. 检查最终组成员与节点真实出口；故意隐藏/错误标记地区不能靠正则消除。
2. 分别测试 AI 登录/API、Gemini AI Studio、Civitai 鉴权及 302 后的实体下载；观察匹配组与实际重定向主机。
3. StabilityMatrix 的本地 WebUI 必须直连；系统代理不生效时启用 TUN，再确认进程规则命中。
4. 用有效下载链接分别测 R2 DIRECT 与代理，对比 Range、ETag、Content-Length、续传和最终文件校验，不只测测速地址。
5. 另行验证 Hosts 绑定；比较开启/关闭 Fake-IP 豁免、sniffer、Early Data，复现后再判断断流根因。
6. 测微信、国内 AI、NAS、qBittorrent、Google、Holodex、4K 视频与 Spotify；误杀从具体规则排查。
7. 检查 IPv6、应用自带 DoH、VPN/WSL/虚拟网卡和 TUN 开关；不要用配置 -t 代替联网验收。

## 参考依据

- [Aethersailor Custom_OpenClash_Rules](https://github.com/Aethersailor/Custom_OpenClash_Rules)：架构参考，其路由器配套设置不能直接等同 Verge 桌面设置。
- [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)、[blackmatrix7](https://github.com/blackmatrix7/ios_rule_script)：精确规则文件及提交见 sources.json。
- [Mihomo DNS](https://wiki.metacubex.one/config/dns/)、[官方配置样例](https://github.com/MetaCubeX/mihomo/blob/Meta/docs/config.yaml)。
- [Cloudflare Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)、[可读取的文档源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/limits.mdx)：本次通过文档源码核实内存/流式处理/时长说明。
- [HF 下载](https://huggingface.co/docs/huggingface_hub/guides/download)、[HF 存储后端](https://huggingface.co/docs/hub/storage-backends)。
- [StabilityMatrix DownloadService](https://github.com/LykosAI/StabilityMatrix/blob/main/StabilityMatrix.Core/Services/DownloadService.cs)：当前 Range/重试逻辑参考。
