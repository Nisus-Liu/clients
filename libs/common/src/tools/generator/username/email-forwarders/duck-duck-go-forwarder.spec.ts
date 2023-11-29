import { DuckDuckGoForwarder } from "./duck-duck-go-forwarder";
import { mockApiService, mockI18nService } from "./mocks.spec";

describe("DuckDuckGo Forwarder", () => {
  describe("constructor(ApiService, I18nService)", () => {
    it("looks up the service name from the i18nService", () => {
      const apiService = mockApiService(200, {});
      const i18nService = mockI18nService();

      const forwarder = new DuckDuckGoForwarder(apiService, i18nService);

      expect(forwarder.serviceName).toEqual("forwarder.serviceName.duckduckgo");
    });
  });

  describe("generate(string | null, SelfHostedApiOptions & EmailDomainOptions)", () => {
    it.each([null, ""])("throws an error if the token is missing (token = %p)", async (token) => {
      const apiService = mockApiService(200, {});
      const i18nService = mockI18nService();

      const forwarder = new DuckDuckGoForwarder(apiService, i18nService);

      await expect(
        async () =>
          await forwarder.generate(null, {
            token,
          })
      ).rejects.toEqual("forwarder.invalidToken");

      expect(apiService.nativeFetch).not.toHaveBeenCalled();
      expect(i18nService.t).toHaveBeenCalledWith(
        "forwarder.invalidToken",
        "forwarder.serviceName.duckduckgo"
      );
    });

    it.each([
      ["jane.doe@duck.com", 201, "jane.doe"],
      ["john.doe@duck.com", 201, "john.doe"],
      ["jane.doe@duck.com", 200, "jane.doe"],
      ["john.doe@duck.com", 200, "john.doe"],
    ])(
      "returns the generated email address (= %p) if the request is successful (status = %p)",
      async (email, status, address) => {
        const apiService = mockApiService(status, { address });
        const i18nService = mockI18nService();

        const forwarder = new DuckDuckGoForwarder(apiService, i18nService);

        const result = await forwarder.generate(null, {
          token: "token",
        });

        expect(result).toEqual(email);
        expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
      }
    );

    it("throws an invalid token error if the request fails with a 401", async () => {
      const apiService = mockApiService(401, {});
      const i18nService = mockI18nService();

      const forwarder = new DuckDuckGoForwarder(apiService, i18nService);

      await expect(
        async () =>
          await forwarder.generate(null, {
            token: "token",
          })
      ).rejects.toEqual("forwarder.invalidToken");

      expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
      // counting instances is terribly flaky over changes, but jest doesn't have a better way to do this
      expect(i18nService.t).toHaveBeenNthCalledWith(
        2,
        "forwarder.invalidToken",
        "forwarder.serviceName.duckduckgo"
      );
    });

    it.each([100, 202, 300, 418, 500, 600])(
      "throws an unknown error if the request returns any other status code (= %i)",
      async (statusCode) => {
        const apiService = mockApiService(statusCode, {});
        const i18nService = mockI18nService();

        const forwarder = new DuckDuckGoForwarder(apiService, i18nService);

        await expect(
          async () =>
            await forwarder.generate(null, {
              token: "token",
            })
        ).rejects.toEqual("forwarder.unknownError");

        expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
        // counting instances is terribly flaky over changes, but jest doesn't have a better way to do this
        expect(i18nService.t).toHaveBeenNthCalledWith(
          2,
          "forwarder.unknownError",
          "forwarder.serviceName.duckduckgo"
        );
      }
    );
  });
});