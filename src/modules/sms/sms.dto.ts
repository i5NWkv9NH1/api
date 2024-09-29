export interface SendSmsDto {
  signName: string
  templateCode: string
  phoneNumbers: string
  templateParam: string
  sourceIp: string
}

export interface RedisSendSmsDto extends SendSmsDto {
  bizId: string
  sendDate: string
}