import { GeneratedDiadocClient, type GeneratedOperationRequest } from './client';

export class GeneratedAuthorizationDomainClient {
  readonly raw = {
    ['AuthenticateConfirmV3']: (request?: GeneratedOperationRequest) => this.generated['AuthenticateConfirmV3'](request),
    ['AuthenticateV3']: (request?: GeneratedOperationRequest) => this.generated['AuthenticateV3'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async authenticateConfirmV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AuthenticateConfirmV3'](request);
  }

  async authenticateV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AuthenticateV3'](request);
  }
}

export class GeneratedCounterpartiesDomainClient {
  readonly raw = {
    ['AcquireCounteragentResultV2']: (request?: GeneratedOperationRequest) => this.generated['AcquireCounteragentResultV2'](request),
    ['AcquireCounteragentV3']: (request?: GeneratedOperationRequest) => this.generated['AcquireCounteragentV3'](request),
    ['AddCounteragentToGroup']: (request?: GeneratedOperationRequest) => this.generated['AddCounteragentToGroup'](request),
    ['BreakWithCounteragentV2']: (request?: GeneratedOperationRequest) => this.generated['BreakWithCounteragentV2'](request),
    ['CreateCounteragentGroup']: (request?: GeneratedOperationRequest) => this.generated['CreateCounteragentGroup'](request),
    ['DeleteCounteragentGroup']: (request?: GeneratedOperationRequest) => this.generated['DeleteCounteragentGroup'](request),
    ['GetCounteragentCertificatesV2']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentCertificatesV2'](request),
    ['GetCounteragentGroup']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentGroup'](request),
    ['GetCounteragentGroups']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentGroups'](request),
    ['GetCounteragentsFromGroup']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentsFromGroup'](request),
    ['GetCounteragentsV3']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentsV3'](request),
    ['GetCounteragentV3']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentV3'](request),
    ['UpdateCounteragentGroup']: (request?: GeneratedOperationRequest) => this.generated['UpdateCounteragentGroup'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async acquireCounteragentResultV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AcquireCounteragentResultV2'](request);
  }

  async acquireCounteragentV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AcquireCounteragentV3'](request);
  }

  async addCounteragentToGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AddCounteragentToGroup'](request);
  }

  async breakWithCounteragentV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['BreakWithCounteragentV2'](request);
  }

  async createCounteragentGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['CreateCounteragentGroup'](request);
  }

  async deleteCounteragentGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DeleteCounteragentGroup'](request);
  }

  async getCounteragentCertificatesV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentCertificatesV2'](request);
  }

  async getCounteragentGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentGroup'](request);
  }

  async getCounteragentGroups(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentGroups'](request);
  }

  async getCounteragentsFromGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentsFromGroup'](request);
  }

  async getCounteragentsV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentsV3'](request);
  }

  async getCounteragentV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentV3'](request);
  }

  async updateCounteragentGroup(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['UpdateCounteragentGroup'](request);
  }
}

export class GeneratedDocflowsDomainClient {
  readonly raw = {
    ['GetDocflowEventsV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowEventsV3'](request),
    ['GetDocflowEventsV4']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowEventsV4'](request),
    ['GetDocflowsByPacketIdV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowsByPacketIdV3'](request),
    ['GetDocflowsByPacketIdV4']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowsByPacketIdV4'](request),
    ['GetDocflowsV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowsV3'](request),
    ['GetDocflowsV4']: (request?: GeneratedOperationRequest) => this.generated['GetDocflowsV4'](request),
    ['SearchDocflowsV3']: (request?: GeneratedOperationRequest) => this.generated['SearchDocflowsV3'](request),
    ['SearchDocflowsV4']: (request?: GeneratedOperationRequest) => this.generated['SearchDocflowsV4'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getDocflowEventsV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowEventsV3'](request);
  }

  async getDocflowEventsV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowEventsV4'](request);
  }

  async getDocflowsByPacketIdV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowsByPacketIdV3'](request);
  }

  async getDocflowsByPacketIdV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowsByPacketIdV4'](request);
  }

  async getDocflowsV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowsV3'](request);
  }

  async getDocflowsV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocflowsV4'](request);
  }

  async searchDocflowsV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['SearchDocflowsV3'](request);
  }

  async searchDocflowsV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['SearchDocflowsV4'](request);
  }
}

export class GeneratedDocumentsDomainClient {
  readonly raw = {
    ['Delete']: (request?: GeneratedOperationRequest) => this.generated['Delete'](request),
    ['DetectDocumentTitles']: (request?: GeneratedOperationRequest) => this.generated['DetectDocumentTitles'](request),
    ['DetectDocumentTitlesOnShelf']: (request?: GeneratedOperationRequest) => this.generated['DetectDocumentTitlesOnShelf'](request),
    ['ForwardDocumentV2']: (request?: GeneratedOperationRequest) => this.generated['ForwardDocumentV2'](request),
    ['GetContent']: (request?: GeneratedOperationRequest) => this.generated['GetContent'](request),
    ['GetDocumentsByMessageId']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentsByMessageId'](request),
    ['GetDocumentsV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentsV3'](request),
    ['GetDocumentsV4']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentsV4'](request),
    ['GetDocumentTypesV2']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentTypesV2'](request),
    ['GetDocumentTypesV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentTypesV3'](request),
    ['GetDocumentV3']: (request?: GeneratedOperationRequest) => this.generated['GetDocumentV3'](request),
    ['GetEntityContentV4']: (request?: GeneratedOperationRequest) => this.generated['GetEntityContentV4'](request),
    ['GetForwardedDocumentsV2']: (request?: GeneratedOperationRequest) => this.generated['GetForwardedDocumentsV2'](request),
    ['GetForwardedEntityContentV2']: (request?: GeneratedOperationRequest) => this.generated['GetForwardedEntityContentV2'](request),
    ['GetInvoiceCorrectionRequestInfo']: (request?: GeneratedOperationRequest) => this.generated['GetInvoiceCorrectionRequestInfo'](request),
    ['GetSignatureInfo']: (request?: GeneratedOperationRequest) => this.generated['GetSignatureInfo'](request),
    ['GetWorkflowsSettingsV2']: (request?: GeneratedOperationRequest) => this.generated['GetWorkflowsSettingsV2'](request),
    ['MoveDocuments']: (request?: GeneratedOperationRequest) => this.generated['MoveDocuments'](request),
    ['RecycleDraft']: (request?: GeneratedOperationRequest) => this.generated['RecycleDraft'](request),
    ['Restore']: (request?: GeneratedOperationRequest) => this.generated['Restore'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async delete(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['Delete'](request);
  }

  async detectDocumentTitles(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DetectDocumentTitles'](request);
  }

  async detectDocumentTitlesOnShelf(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DetectDocumentTitlesOnShelf'](request);
  }

  async forwardDocumentV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ForwardDocumentV2'](request);
  }

  async getContent(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetContent'](request);
  }

  async getDocumentsByMessageId(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentsByMessageId'](request);
  }

  async getDocumentsV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentsV3'](request);
  }

  async getDocumentsV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentsV4'](request);
  }

  async getDocumentTypesV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentTypesV2'](request);
  }

  async getDocumentTypesV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentTypesV3'](request);
  }

  async getDocumentV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDocumentV3'](request);
  }

  async getEntityContentV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEntityContentV4'](request);
  }

  async getForwardedDocumentsV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetForwardedDocumentsV2'](request);
  }

  async getForwardedEntityContentV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetForwardedEntityContentV2'](request);
  }

  async getInvoiceCorrectionRequestInfo(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetInvoiceCorrectionRequestInfo'](request);
  }

  async getSignatureInfo(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetSignatureInfo'](request);
  }

  async getWorkflowsSettingsV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetWorkflowsSettingsV2'](request);
  }

  async moveDocuments(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['MoveDocuments'](request);
  }

  async recycleDraft(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['RecycleDraft'](request);
  }

  async restore(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['Restore'](request);
  }
}

export class GeneratedDocumentShelfDomainClient {
  readonly raw = {
    ['ShelfDownloadV2']: (request?: GeneratedOperationRequest) => this.generated['ShelfDownloadV2'](request),
    ['ShelfUploadPart']: (request?: GeneratedOperationRequest) => this.generated['ShelfUploadPart'](request),
    ['ShelfUploadPartInit']: (request?: GeneratedOperationRequest) => this.generated['ShelfUploadPartInit'](request),
    ['ShelfUploadV2']: (request?: GeneratedOperationRequest) => this.generated['ShelfUploadV2'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async shelfDownloadV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ShelfDownloadV2'](request);
  }

  async shelfUploadPart(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ShelfUploadPart'](request);
  }

  async shelfUploadPartInit(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ShelfUploadPartInit'](request);
  }

  async shelfUploadV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ShelfUploadV2'](request);
  }
}

export class GeneratedEmployeesDomainClient {
  readonly raw = {
    ['CanSendInvoice']: (request?: GeneratedOperationRequest) => this.generated['CanSendInvoice'](request),
    ['CreateEmployee']: (request?: GeneratedOperationRequest) => this.generated['CreateEmployee'](request),
    ['DeleteEmployee']: (request?: GeneratedOperationRequest) => this.generated['DeleteEmployee'](request),
    ['GetEmployee']: (request?: GeneratedOperationRequest) => this.generated['GetEmployee'](request),
    ['GetEmployees']: (request?: GeneratedOperationRequest) => this.generated['GetEmployees'](request),
    ['GetMyCertificates']: (request?: GeneratedOperationRequest) => this.generated['GetMyCertificates'](request),
    ['GetMyEmployee']: (request?: GeneratedOperationRequest) => this.generated['GetMyEmployee'](request),
    ['GetMyUserV2']: (request?: GeneratedOperationRequest) => this.generated['GetMyUserV2'](request),
    ['GetOrganizationUsersV2']: (request?: GeneratedOperationRequest) => this.generated['GetOrganizationUsersV2'](request),
    ['GetSubscriptions']: (request?: GeneratedOperationRequest) => this.generated['GetSubscriptions'](request),
    ['UpdateEmployee']: (request?: GeneratedOperationRequest) => this.generated['UpdateEmployee'](request),
    ['UpdateSubscriptions']: (request?: GeneratedOperationRequest) => this.generated['UpdateSubscriptions'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async canSendInvoice(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['CanSendInvoice'](request);
  }

  async createEmployee(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['CreateEmployee'](request);
  }

  async deleteEmployee(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DeleteEmployee'](request);
  }

  async getEmployee(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEmployee'](request);
  }

  async getEmployees(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEmployees'](request);
  }

  async getMyCertificates(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMyCertificates'](request);
  }

  async getMyEmployee(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMyEmployee'](request);
  }

  async getMyUserV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMyUserV2'](request);
  }

  async getOrganizationUsersV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetOrganizationUsersV2'](request);
  }

  async getSubscriptions(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetSubscriptions'](request);
  }

  async updateEmployee(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['UpdateEmployee'](request);
  }

  async updateSubscriptions(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['UpdateSubscriptions'](request);
  }
}

export class GeneratedEventsDomainClient {
  readonly raw = {
    ['GetCounteragentEventsV1']: (request?: GeneratedOperationRequest) => this.generated['GetCounteragentEventsV1'](request),
    ['GetEventV2']: (request?: GeneratedOperationRequest) => this.generated['GetEventV2'](request),
    ['GetEventV3']: (request?: GeneratedOperationRequest) => this.generated['GetEventV3'](request),
    ['GetForwardedDocumentEventsV2']: (request?: GeneratedOperationRequest) => this.generated['GetForwardedDocumentEventsV2'](request),
    ['GetLastEvent']: (request?: GeneratedOperationRequest) => this.generated['GetLastEvent'](request),
    ['GetLastEventV2']: (request?: GeneratedOperationRequest) => this.generated['GetLastEventV2'](request),
    ['GetNewEventsV7']: (request?: GeneratedOperationRequest) => this.generated['GetNewEventsV7'](request),
    ['GetNewEventsV8']: (request?: GeneratedOperationRequest) => this.generated['GetNewEventsV8'](request),
    ['GetPartnerEvents']: (request?: GeneratedOperationRequest) => this.generated['GetPartnerEvents'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getCounteragentEventsV1(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetCounteragentEventsV1'](request);
  }

  async getEventV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEventV2'](request);
  }

  async getEventV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEventV3'](request);
  }

  async getForwardedDocumentEventsV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetForwardedDocumentEventsV2'](request);
  }

  async getLastEvent(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetLastEvent'](request);
  }

  async getLastEventV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetLastEventV2'](request);
  }

  async getNewEventsV7(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetNewEventsV7'](request);
  }

  async getNewEventsV8(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetNewEventsV8'](request);
  }

  async getPartnerEvents(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetPartnerEvents'](request);
  }
}

export class GeneratedGenerationDomainClient {
  readonly raw = {
    ['GenerateInvoiceCorrectionRequestXmlV2']: (request?: GeneratedOperationRequest) => this.generated['GenerateInvoiceCorrectionRequestXmlV2'](request),
    ['GenerateReceiptXmlV2']: (request?: GeneratedOperationRequest) => this.generated['GenerateReceiptXmlV2'](request),
    ['GenerateRevocationRequestXmlV2']: (request?: GeneratedOperationRequest) => this.generated['GenerateRevocationRequestXmlV2'](request),
    ['GenerateSignatureRejectionXmlV2']: (request?: GeneratedOperationRequest) => this.generated['GenerateSignatureRejectionXmlV2'](request),
    ['GenerateTitleXml']: (request?: GeneratedOperationRequest) => this.generated['GenerateTitleXml'](request),
    ['GenerateUniversalMessage']: (request?: GeneratedOperationRequest) => this.generated['GenerateUniversalMessage'](request),
    ['ParseRevocationRequestXml']: (request?: GeneratedOperationRequest) => this.generated['ParseRevocationRequestXml'](request),
    ['ParseSignatureRejectionXml']: (request?: GeneratedOperationRequest) => this.generated['ParseSignatureRejectionXml'](request),
    ['ParseTitleXml']: (request?: GeneratedOperationRequest) => this.generated['ParseTitleXml'](request),
    ['ParseUniversalMessage']: (request?: GeneratedOperationRequest) => this.generated['ParseUniversalMessage'](request),
    ['ParseUniversalMessageXml']: (request?: GeneratedOperationRequest) => this.generated['ParseUniversalMessageXml'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async generateInvoiceCorrectionRequestXmlV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateInvoiceCorrectionRequestXmlV2'](request);
  }

  async generateReceiptXmlV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateReceiptXmlV2'](request);
  }

  async generateRevocationRequestXmlV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateRevocationRequestXmlV2'](request);
  }

  async generateSignatureRejectionXmlV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateSignatureRejectionXmlV2'](request);
  }

  async generateTitleXml(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateTitleXml'](request);
  }

  async generateUniversalMessage(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateUniversalMessage'](request);
  }

  async parseRevocationRequestXml(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ParseRevocationRequestXml'](request);
  }

  async parseSignatureRejectionXml(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ParseSignatureRejectionXml'](request);
  }

  async parseTitleXml(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ParseTitleXml'](request);
  }

  async parseUniversalMessage(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ParseUniversalMessage'](request);
  }

  async parseUniversalMessageXml(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['ParseUniversalMessageXml'](request);
  }
}

export class GeneratedMessagesDomainClient {
  readonly raw = {
    ['GetMessageV5']: (request?: GeneratedOperationRequest) => this.generated['GetMessageV5'](request),
    ['GetMessageV6']: (request?: GeneratedOperationRequest) => this.generated['GetMessageV6'](request),
    ['PostMessagePatchV3']: (request?: GeneratedOperationRequest) => this.generated['PostMessagePatchV3'](request),
    ['PostMessagePatchV4']: (request?: GeneratedOperationRequest) => this.generated['PostMessagePatchV4'](request),
    ['PostMessageV3']: (request?: GeneratedOperationRequest) => this.generated['PostMessageV3'](request),
    ['PostTemplate']: (request?: GeneratedOperationRequest) => this.generated['PostTemplate'](request),
    ['PostTemplatePatch']: (request?: GeneratedOperationRequest) => this.generated['PostTemplatePatch'](request),
    ['SendDraft']: (request?: GeneratedOperationRequest) => this.generated['SendDraft'](request),
    ['TransformTemplateToMessage']: (request?: GeneratedOperationRequest) => this.generated['TransformTemplateToMessage'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getMessageV5(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMessageV5'](request);
  }

  async getMessageV6(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMessageV6'](request);
  }

  async postMessagePatchV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostMessagePatchV3'](request);
  }

  async postMessagePatchV4(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostMessagePatchV4'](request);
  }

  async postMessageV3(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostMessageV3'](request);
  }

  async postTemplate(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostTemplate'](request);
  }

  async postTemplatePatch(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostTemplatePatch'](request);
  }

  async sendDraft(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['SendDraft'](request);
  }

  async transformTemplateToMessage(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['TransformTemplateToMessage'](request);
  }
}

export class GeneratedOperatorsDomainClient {
  readonly raw = {
    ['GetRoamingOperators']: (request?: GeneratedOperationRequest) => this.generated['GetRoamingOperators'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getRoamingOperators(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetRoamingOperators'](request);
  }
}

export class GeneratedOrganizationsDomainClient {
  readonly raw = {
    ['GetBox']: (request?: GeneratedOperationRequest) => this.generated['GetBox'](request),
    ['GetDepartmentV2']: (request?: GeneratedOperationRequest) => this.generated['GetDepartmentV2'](request),
    ['GetMyOrganizations']: (request?: GeneratedOperationRequest) => this.generated['GetMyOrganizations'](request),
    ['GetOrganization']: (request?: GeneratedOperationRequest) => this.generated['GetOrganization'](request),
    ['GetOrganizationFeatures']: (request?: GeneratedOperationRequest) => this.generated['GetOrganizationFeatures'](request),
    ['GetOrganizationsByInnKpp']: (request?: GeneratedOperationRequest) => this.generated['GetOrganizationsByInnKpp'](request),
    ['GetOrganizationsByInnListV2']: (request?: GeneratedOperationRequest) => this.generated['GetOrganizationsByInnListV2'](request),
    ['GetResolutionRoutes']: (request?: GeneratedOperationRequest) => this.generated['GetResolutionRoutes'](request),
    ['GetResolutionRoutesForOrganization']: (request?: GeneratedOperationRequest) => this.generated['GetResolutionRoutesForOrganization'](request),
    ['Register']: (request?: GeneratedOperationRequest) => this.generated['Register'](request),
    ['RegisterConfirm']: (request?: GeneratedOperationRequest) => this.generated['RegisterConfirm'](request),
    ['SendFnsRegistrationMessage']: (request?: GeneratedOperationRequest) => this.generated['SendFnsRegistrationMessage'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getBox(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetBox'](request);
  }

  async getDepartmentV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetDepartmentV2'](request);
  }

  async getMyOrganizations(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetMyOrganizations'](request);
  }

  async getOrganization(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetOrganization'](request);
  }

  async getOrganizationFeatures(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetOrganizationFeatures'](request);
  }

  async getOrganizationsByInnKpp(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetOrganizationsByInnKpp'](request);
  }

  async getOrganizationsByInnListV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetOrganizationsByInnListV2'](request);
  }

  async getResolutionRoutes(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetResolutionRoutes'](request);
  }

  async getResolutionRoutesForOrganization(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetResolutionRoutesForOrganization'](request);
  }

  async register(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['Register'](request);
  }

  async registerConfirm(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['RegisterConfirm'](request);
  }

  async sendFnsRegistrationMessage(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['SendFnsRegistrationMessage'](request);
  }
}

export class GeneratedPowerOfAttorneyDomainClient {
  readonly raw = {
    ['AddEmployeePowerOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['AddEmployeePowerOfAttorney'](request),
    ['AddEmployeePowerOfAttorneyV2']: (request?: GeneratedOperationRequest) => this.generated['AddEmployeePowerOfAttorneyV2'](request),
    ['DeleteEmployeePowerOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['DeleteEmployeePowerOfAttorney'](request),
    ['DeleteEmployeePowerOfAttorneyV2']: (request?: GeneratedOperationRequest) => this.generated['DeleteEmployeePowerOfAttorneyV2'](request),
    ['GetEmployeePowersOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['GetEmployeePowersOfAttorney'](request),
    ['GetPowerOfAttorneyContentV2']: (request?: GeneratedOperationRequest) => this.generated['GetPowerOfAttorneyContentV2'](request),
    ['GetPowerOfAttorneyInfo']: (request?: GeneratedOperationRequest) => this.generated['GetPowerOfAttorneyInfo'](request),
    ['PrevalidatePowerOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['PrevalidatePowerOfAttorney'](request),
    ['PrevalidatePowerOfAttorneyV2']: (request?: GeneratedOperationRequest) => this.generated['PrevalidatePowerOfAttorneyV2'](request),
    ['RegisterPowerOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['RegisterPowerOfAttorney'](request),
    ['RegisterPowerOfAttorneyResult']: (request?: GeneratedOperationRequest) => this.generated['RegisterPowerOfAttorneyResult'](request),
    ['UpdateEmployeePowerOfAttorney']: (request?: GeneratedOperationRequest) => this.generated['UpdateEmployeePowerOfAttorney'](request),
    ['UpdateEmployeePowerOfAttorneyV2']: (request?: GeneratedOperationRequest) => this.generated['UpdateEmployeePowerOfAttorneyV2'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async addEmployeePowerOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AddEmployeePowerOfAttorney'](request);
  }

  async addEmployeePowerOfAttorneyV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['AddEmployeePowerOfAttorneyV2'](request);
  }

  async deleteEmployeePowerOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DeleteEmployeePowerOfAttorney'](request);
  }

  async deleteEmployeePowerOfAttorneyV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DeleteEmployeePowerOfAttorneyV2'](request);
  }

  async getEmployeePowersOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetEmployeePowersOfAttorney'](request);
  }

  async getPowerOfAttorneyContentV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetPowerOfAttorneyContentV2'](request);
  }

  async getPowerOfAttorneyInfo(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetPowerOfAttorneyInfo'](request);
  }

  async prevalidatePowerOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PrevalidatePowerOfAttorney'](request);
  }

  async prevalidatePowerOfAttorneyV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PrevalidatePowerOfAttorneyV2'](request);
  }

  async registerPowerOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['RegisterPowerOfAttorney'](request);
  }

  async registerPowerOfAttorneyResult(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['RegisterPowerOfAttorneyResult'](request);
  }

  async updateEmployeePowerOfAttorney(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['UpdateEmployeePowerOfAttorney'](request);
  }

  async updateEmployeePowerOfAttorneyV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['UpdateEmployeePowerOfAttorneyV2'](request);
  }
}

export class GeneratedPrintFormsDomainClient {
  readonly raw = {
    ['DetectCustomPrintForms']: (request?: GeneratedOperationRequest) => this.generated['DetectCustomPrintForms'](request),
    ['GenerateDocumentProtocol']: (request?: GeneratedOperationRequest) => this.generated['GenerateDocumentProtocol'](request),
    ['GenerateDocumentZip']: (request?: GeneratedOperationRequest) => this.generated['GenerateDocumentZip'](request),
    ['GeneratePrintForm']: (request?: GeneratedOperationRequest) => this.generated['GeneratePrintForm'](request),
    ['GeneratePrintFormFromAttachment']: (request?: GeneratedOperationRequest) => this.generated['GeneratePrintFormFromAttachment'](request),
    ['GetGeneratedPrintForm']: (request?: GeneratedOperationRequest) => this.generated['GetGeneratedPrintForm'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async detectCustomPrintForms(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DetectCustomPrintForms'](request);
  }

  async generateDocumentProtocol(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateDocumentProtocol'](request);
  }

  async generateDocumentZip(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GenerateDocumentZip'](request);
  }

  async generatePrintForm(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GeneratePrintForm'](request);
  }

  async generatePrintFormFromAttachment(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GeneratePrintFormFromAttachment'](request);
  }

  async getGeneratedPrintForm(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetGeneratedPrintForm'](request);
  }
}

export class GeneratedSignaturesDomainClient {
  readonly raw = {
    ['DssSign']: (request?: GeneratedOperationRequest) => this.generated['DssSign'](request),
    ['DssSignResult']: (request?: GeneratedOperationRequest) => this.generated['DssSignResult'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async dssSign(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DssSign'](request);
  }

  async dssSignResult(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['DssSignResult'](request);
  }
}

export class GeneratedSigningDomainClient {
  readonly raw = {
    ['GetSignerDetailsV2']: (request?: GeneratedOperationRequest) => this.generated['GetSignerDetailsV2'](request),
    ['PostSignerDetailsV2']: (request?: GeneratedOperationRequest) => this.generated['PostSignerDetailsV2'](request),
    ['PrepareDocumentsToSign']: (request?: GeneratedOperationRequest) => this.generated['PrepareDocumentsToSign'](request),
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

  async getSignerDetailsV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['GetSignerDetailsV2'](request);
  }

  async postSignerDetailsV2(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PostSignerDetailsV2'](request);
  }

  async prepareDocumentsToSign(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated['PrepareDocumentsToSign'](request);
  }
}
