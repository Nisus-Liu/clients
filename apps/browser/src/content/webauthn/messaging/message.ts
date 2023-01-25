import {
  CredentialAssertParams,
  CredentialAssertResult,
  CredentialRegistrationParams,
  CredentialRegistrationResult,
} from "@bitwarden/common/abstractions/fido2/fido2.service.abstraction";

import { MessageError } from "./error";

export enum MessageType {
  CredentialCreationRequest,
  CredentialCreationResponse,
  CredentialGetRequest,
  CredentialGetResponse,
  AbortRequest,
  AbortResponse,
}

export type CredentialCreationRequest = {
  type: MessageType.CredentialCreationRequest;
  data: CredentialRegistrationParams;
};

export type CredentialCreationResponse = {
  type: MessageType.CredentialCreationResponse;
  result?: CredentialRegistrationResult;
  error?: MessageError;
};

export type CredentialGetRequest = {
  type: MessageType.CredentialGetRequest;
  data: CredentialAssertParams;
};

export type CredentialGetResponse = {
  type: MessageType.CredentialGetResponse;
  result?: CredentialAssertResult;
  error?: MessageError;
};

export type AbortRequest = {
  type: MessageType.AbortRequest;
};

export type AbortResponse = {
  type: MessageType.AbortResponse;
};

export type Message =
  | CredentialCreationRequest
  | CredentialCreationResponse
  | CredentialGetRequest
  | CredentialGetResponse
  | AbortRequest
  | AbortResponse;