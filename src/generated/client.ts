import type { DiadocRequestOptions } from '../core/request-options';

export type GeneratedOperationRequest = DiadocRequestOptions;

export interface GeneratedCoreClient {
  request<T = unknown>(operationId: string, request?: GeneratedOperationRequest): Promise<T>;
}

export class GeneratedDiadocClient {
  constructor(private readonly core: GeneratedCoreClient) {}

  async ['AcquireCounteragentResultV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AcquireCounteragentResultV2', request);
  }

  async ['AcquireCounteragentV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AcquireCounteragentV3', request);
  }

  async ['AddCounteragentToGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AddCounteragentToGroup', request);
  }

  async ['AddEmployeePowerOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AddEmployeePowerOfAttorney', request);
  }

  async ['AddEmployeePowerOfAttorneyV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AddEmployeePowerOfAttorneyV2', request);
  }

  async ['AuthenticateConfirmV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AuthenticateConfirmV3', request);
  }

  async ['AuthenticateV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('AuthenticateV3', request);
  }

  async ['BreakWithCounteragentV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('BreakWithCounteragentV2', request);
  }

  async ['CanSendInvoice'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('CanSendInvoice', request);
  }

  async ['CreateCounteragentGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('CreateCounteragentGroup', request);
  }

  async ['CreateEmployee'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('CreateEmployee', request);
  }

  async ['Delete'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('Delete', request);
  }

  async ['DeleteCounteragentGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DeleteCounteragentGroup', request);
  }

  async ['DeleteEmployee'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DeleteEmployee', request);
  }

  async ['DeleteEmployeePowerOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DeleteEmployeePowerOfAttorney', request);
  }

  async ['DeleteEmployeePowerOfAttorneyV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DeleteEmployeePowerOfAttorneyV2', request);
  }

  async ['DetectCustomPrintForms'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DetectCustomPrintForms', request);
  }

  async ['DetectDocumentTitles'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DetectDocumentTitles', request);
  }

  async ['DetectDocumentTitlesOnShelf'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DetectDocumentTitlesOnShelf', request);
  }

  async ['DssSign'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DssSign', request);
  }

  async ['DssSignResult'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('DssSignResult', request);
  }

  async ['ForwardDocumentV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ForwardDocumentV2', request);
  }

  async ['GenerateDocumentProtocol'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateDocumentProtocol', request);
  }

  async ['GenerateDocumentZip'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateDocumentZip', request);
  }

  async ['GenerateInvoiceCorrectionRequestXmlV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateInvoiceCorrectionRequestXmlV2', request);
  }

  async ['GeneratePrintForm'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GeneratePrintForm', request);
  }

  async ['GeneratePrintFormFromAttachment'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GeneratePrintFormFromAttachment', request);
  }

  async ['GenerateReceiptXmlV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateReceiptXmlV2', request);
  }

  async ['GenerateRevocationRequestXmlV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateRevocationRequestXmlV2', request);
  }

  async ['GenerateSignatureRejectionXmlV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateSignatureRejectionXmlV2', request);
  }

  async ['GenerateTitleXml'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateTitleXml', request);
  }

  async ['GenerateUniversalMessage'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GenerateUniversalMessage', request);
  }

  async ['GetBox'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetBox', request);
  }

  async ['GetContent'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetContent', request);
  }

  async ['GetCounteragentCertificatesV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentCertificatesV2', request);
  }

  async ['GetCounteragentEventsV1'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentEventsV1', request);
  }

  async ['GetCounteragentGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentGroup', request);
  }

  async ['GetCounteragentGroups'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentGroups', request);
  }

  async ['GetCounteragentsFromGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentsFromGroup', request);
  }

  async ['GetCounteragentsV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentsV3', request);
  }

  async ['GetCounteragentV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetCounteragentV3', request);
  }

  async ['GetDepartmentV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDepartmentV2', request);
  }

  async ['GetDocflowEventsV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowEventsV3', request);
  }

  async ['GetDocflowEventsV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowEventsV4', request);
  }

  async ['GetDocflowsByPacketIdV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowsByPacketIdV3', request);
  }

  async ['GetDocflowsByPacketIdV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowsByPacketIdV4', request);
  }

  async ['GetDocflowsV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowsV3', request);
  }

  async ['GetDocflowsV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocflowsV4', request);
  }

  async ['GetDocumentsByMessageId'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentsByMessageId', request);
  }

  async ['GetDocumentsV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentsV3', request);
  }

  async ['GetDocumentsV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentsV4', request);
  }

  async ['GetDocumentTypesV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentTypesV2', request);
  }

  async ['GetDocumentTypesV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentTypesV3', request);
  }

  async ['GetDocumentV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetDocumentV3', request);
  }

  async ['GetEmployee'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEmployee', request);
  }

  async ['GetEmployeePowersOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEmployeePowersOfAttorney', request);
  }

  async ['GetEmployees'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEmployees', request);
  }

  async ['GetEntityContentV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEntityContentV4', request);
  }

  async ['GetEventV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEventV2', request);
  }

  async ['GetEventV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetEventV3', request);
  }

  async ['GetForwardedDocumentEventsV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetForwardedDocumentEventsV2', request);
  }

  async ['GetForwardedDocumentsV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetForwardedDocumentsV2', request);
  }

  async ['GetForwardedEntityContentV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetForwardedEntityContentV2', request);
  }

  async ['GetGeneratedPrintForm'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetGeneratedPrintForm', request);
  }

  async ['GetInvoiceCorrectionRequestInfo'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetInvoiceCorrectionRequestInfo', request);
  }

  async ['GetLastEvent'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetLastEvent', request);
  }

  async ['GetLastEventV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetLastEventV2', request);
  }

  async ['GetMessageV5'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMessageV5', request);
  }

  async ['GetMessageV6'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMessageV6', request);
  }

  async ['GetMyCertificates'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMyCertificates', request);
  }

  async ['GetMyEmployee'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMyEmployee', request);
  }

  async ['GetMyOrganizations'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMyOrganizations', request);
  }

  async ['GetMyUserV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetMyUserV2', request);
  }

  async ['GetNewEventsV7'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetNewEventsV7', request);
  }

  async ['GetNewEventsV8'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetNewEventsV8', request);
  }

  async ['GetOrganization'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetOrganization', request);
  }

  async ['GetOrganizationFeatures'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetOrganizationFeatures', request);
  }

  async ['GetOrganizationsByInnKpp'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetOrganizationsByInnKpp', request);
  }

  async ['GetOrganizationsByInnListV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetOrganizationsByInnListV2', request);
  }

  async ['GetOrganizationUsersV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetOrganizationUsersV2', request);
  }

  async ['GetPartnerEvents'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetPartnerEvents', request);
  }

  async ['GetPowerOfAttorneyContentV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetPowerOfAttorneyContentV2', request);
  }

  async ['GetPowerOfAttorneyInfo'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetPowerOfAttorneyInfo', request);
  }

  async ['GetResolutionRoutes'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetResolutionRoutes', request);
  }

  async ['GetResolutionRoutesForOrganization'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetResolutionRoutesForOrganization', request);
  }

  async ['GetRoamingOperators'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetRoamingOperators', request);
  }

  async ['GetSignatureInfo'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetSignatureInfo', request);
  }

  async ['GetSignerDetailsV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetSignerDetailsV2', request);
  }

  async ['GetSubscriptions'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetSubscriptions', request);
  }

  async ['GetWorkflowsSettingsV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('GetWorkflowsSettingsV2', request);
  }

  async ['MoveDocuments'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('MoveDocuments', request);
  }

  async ['ParseRevocationRequestXml'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ParseRevocationRequestXml', request);
  }

  async ['ParseSignatureRejectionXml'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ParseSignatureRejectionXml', request);
  }

  async ['ParseTitleXml'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ParseTitleXml', request);
  }

  async ['ParseUniversalMessage'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ParseUniversalMessage', request);
  }

  async ['ParseUniversalMessageXml'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ParseUniversalMessageXml', request);
  }

  async ['PostMessagePatchV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostMessagePatchV3', request);
  }

  async ['PostMessagePatchV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostMessagePatchV4', request);
  }

  async ['PostMessageV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostMessageV3', request);
  }

  async ['PostSignerDetailsV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostSignerDetailsV2', request);
  }

  async ['PostTemplate'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostTemplate', request);
  }

  async ['PostTemplatePatch'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PostTemplatePatch', request);
  }

  async ['PrepareDocumentsToSign'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PrepareDocumentsToSign', request);
  }

  async ['PrevalidatePowerOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PrevalidatePowerOfAttorney', request);
  }

  async ['PrevalidatePowerOfAttorneyV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('PrevalidatePowerOfAttorneyV2', request);
  }

  async ['RecycleDraft'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('RecycleDraft', request);
  }

  async ['Register'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('Register', request);
  }

  async ['RegisterConfirm'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('RegisterConfirm', request);
  }

  async ['RegisterPowerOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('RegisterPowerOfAttorney', request);
  }

  async ['RegisterPowerOfAttorneyResult'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('RegisterPowerOfAttorneyResult', request);
  }

  async ['Restore'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('Restore', request);
  }

  async ['SearchDocflowsV3'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('SearchDocflowsV3', request);
  }

  async ['SearchDocflowsV4'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('SearchDocflowsV4', request);
  }

  async ['SendDraft'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('SendDraft', request);
  }

  async ['SendFnsRegistrationMessage'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('SendFnsRegistrationMessage', request);
  }

  async ['ShelfDownloadV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ShelfDownloadV2', request);
  }

  async ['ShelfUploadPart'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ShelfUploadPart', request);
  }

  async ['ShelfUploadPartInit'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ShelfUploadPartInit', request);
  }

  async ['ShelfUploadV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('ShelfUploadV2', request);
  }

  async ['TransformTemplateToMessage'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('TransformTemplateToMessage', request);
  }

  async ['UpdateCounteragentGroup'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('UpdateCounteragentGroup', request);
  }

  async ['UpdateEmployee'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('UpdateEmployee', request);
  }

  async ['UpdateEmployeePowerOfAttorney'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('UpdateEmployeePowerOfAttorney', request);
  }

  async ['UpdateEmployeePowerOfAttorneyV2'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('UpdateEmployeePowerOfAttorneyV2', request);
  }

  async ['UpdateSubscriptions'](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('UpdateSubscriptions', request);
  }
}
