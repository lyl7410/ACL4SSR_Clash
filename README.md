# 个人 Clash / Mihomo 分流配置

适用于 Clash Verge Rev 的个人订阅转换与配套覆写。新方案版本：2026-10-14。

- [完整设计、使用方法与测试清单](docs/Personal_Advanced.md)
- [Subconverter INI 模板](Clash/config/Personal_Advanced.ini)
- [Mihomo override.yaml](Clash/config/Personal_Advanced_override.yaml)
- [自建 CF 节点调优脚本](Clash/config/Personal_Advanced_node_tuning.js)
- [来源与变更记录](docs/Personal_Advanced_sources.json)
- [本地验证结果](docs/Personal_Advanced_validation.json)

特点：AI 安全候选池、五地区测速、优选故障转移、Civitai/R2 鉴权与传输分离、StabilityMatrix 进程兜底、DNS/Fake-IP/嗅探配套。原 rule/ 下的 9 份个人规则原样保留，修复副本新增在 rule/Personal_Advanced/。

`.ini` 是转换器输入，必须先生成 Clash YAML。覆写片段也不是独立订阅。需要自己的有效节点；本次通过配置解析和实际本机转换检查，未测试真实机场、下载速度、断流恢复或 TUN 联网。
