import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { CipherBulkDeleteRequest } from "@bitwarden/common/models/request/cipherBulkDeleteRequest";
import { CollectionBulkDeleteRequest } from "@bitwarden/common/models/request/collectionBulkDeleteRequest";

@Component({
  selector: "app-vault-bulk-delete",
  templateUrl: "bulk-delete.component.html",
})
export class BulkDeleteComponent {
  @Input() cipherIds: string[] = [];
  @Input() collectionIds: string[] = [];
  @Input() permanent = false;
  @Input() organization: Organization;
  @Output() onDeleted = new EventEmitter();

  formPromise: Promise<any>;

  constructor(
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private apiService: ApiService
  ) {}

  async submit() {
    let deleteCiphersPromise: Promise<void>;
    if (!this.organization || !this.organization.canEditAnyCollection) {
      deleteCiphersPromise = this.deleteCiphers();
    } else {
      deleteCiphersPromise = this.deleteCiphersAdmin();
    }

    this.formPromise = Promise.all([deleteCiphersPromise, this.deleteCollections()]);
    await this.formPromise;

    this.onDeleted.emit();
    if (this.cipherIds.length) {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.permanent ? "permanentlyDeletedItems" : "deletedItems")
      );
    }
    if (this.collectionIds.length) {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deletedCollections")
      );
    }
  }

  private async deleteCiphers(): Promise<any> {
    if (this.permanent) {
      await this.cipherService.deleteManyWithServer(this.cipherIds);
    } else {
      await this.cipherService.softDeleteManyWithServer(this.cipherIds);
    }
  }

  private async deleteCiphersAdmin(): Promise<any> {
    const deleteRequest = new CipherBulkDeleteRequest(this.cipherIds, this.organization.id);
    if (this.permanent) {
      return await this.apiService.deleteManyCiphersAdmin(deleteRequest);
    } else {
      return await this.apiService.putDeleteManyCiphersAdmin(deleteRequest);
    }
  }

  private async deleteCollections(): Promise<any> {
    if (!this.organization.canDeleteAssignedCollections) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("missingPermissions")
      );
      return;
    }
    const deleteRequest = new CollectionBulkDeleteRequest(this.collectionIds, this.organization.id);
    return await this.apiService.deleteManyCollections(deleteRequest);
  }
}
