import { HtmlStorageLocation } from "../../enums";
import { AppIdService as AppIdServiceAbstraction } from "../abstractions/app-id.service";
import { AbstractStorageService } from "../abstractions/storage.service";
import { Utils } from "../misc/utils";

export class AppIdService implements AppIdServiceAbstraction {
  constructor(private storageService: AbstractStorageService) {}

  getAppId(): Promise<string> {
    return this.makeAndGetAppId("appId");
  }

  getAnonymousAppId(): Promise<string> {
    return this.makeAndGetAppId("anonymousAppId");
  }

  private async makeAndGetAppId(key: string) {
    const existingId = await this.storageService.get<string>(key, {
      htmlStorageLocation: HtmlStorageLocation.Local, //: 如果浏览器环境, 使用的 Local Storage
    });
    if (existingId != null) {
      return existingId;
    }

    const guid = Utils.newGuid();
    await this.storageService.save(key, guid, {
      htmlStorageLocation: HtmlStorageLocation.Local,
    });
    return guid;
  }
}
