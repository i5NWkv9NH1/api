export interface AliCloudSMSResponse {
  Message: string
  RequestId: string
  Code: 'OK' | 'ERROR'
  BizId: string
}