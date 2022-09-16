"use strict";

{
  var browser = browser || chrome;

  const updateBadge = async (isEnabled) => {
    if (isEnabled == "true") {
      await browser.action.setBadgeText({ text: "ON" });
      await browser.action.setBadgeBackgroundColor({ color: "green" });
    } else {
      await browser.action.setBadgeText({ text: "OFF" });
      await browser.action.setBadgeBackgroundColor({ color: "lightgrey" });
    }
  }

  const mainProcessImpl = async () => {
    const status = await browser.storage.session.get(["lastRun", "isEnabled"]);
    if(status.isEnabled!== "true") return;

    const lastRun = !status.lastRun ? 0 : parseInt(status.lastRun);
    const now = new Date().getTime();
    if (now < lastRun + 1000) return;

    const settings = await browser.storage.local.get(["targetUrls"]);
    const targetUrls = settings.targetUrls || [""];

    const tabs = await browser.tabs.query({ windowType: "normal" });
    const currentUrls = tabs.map((tab) => tab.url);

    const notOpenedUrls = targetUrls.filter(
      (url) => !currentUrls.find((curl) => curl.indexOf(url) != -1)
    );

    if (notOpenedUrls.length == 0) return;

    await browser.storage.session.set({ lastRun: now });

    await notOpenedUrls.forEach(async (url) => {
      try {
        await browser.tabs.create({ url });
      } catch {}
    });

    browser.alarms.create({ delayInMinutes: 1 });
  };

  var shortlock = false;

  const mainProcess = async () => {
    if (shortlock) return;
    shortlock = true;

    await mainProcessImpl();

    shortlock = false;
  };

  browser.tabs.onActivated.addListener(mainProcess);
  browser.tabs.onCreated.addListener(mainProcess);
  browser.tabs.onRemoved.addListener(mainProcess);
  browser.tabs.onUpdated.addListener(mainProcess);

  browser.alarms.onAlarm.addListener(mainProcess);

  browser.action.onClicked.addListener(async () => {
    const status = await browser.storage.session.get(["isEnabled"]);
    const newIsEnabled = status.isEnabled === "true" ? "false" : "true";
    await browser.storage.session.set({ isEnabled: newIsEnabled });
    await updateBadge(newIsEnabled);
    await mainProcess();
  });

  updateBadge("false");
}
