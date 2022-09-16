'use strict';

{

    var browser = (browser || chrome);

    let localizeHtmlPage = () => {
        var objects = document.getElementsByTagName('html');
        for (var j = 0; j < objects.length; j++) {
            var obj = objects[j];

            var valStrH = obj.innerHTML.toString();
            var valNewH = valStrH.replace(/__MSG_(\w+)__/g, (_, v1) => {
                return v1 ? browser.i18n.getMessage(v1) : "";
            });

            if (valNewH != valStrH) {
                obj.innerHTML = valNewH;
            }
        }
    }

    let saveOptions = async () => {
        const targetUrls = document.getElementById('urls').value.split("\n");
        await browser.storage.local.set({ "targetUrls": targetUrls });
    }

    let restoreOptions = async () => {

        const settings = (await browser.storage.local.get(["targetUrls"]));
        const targetUrls = (settings.targetUrls || [""]);

        console.log(targetUrls);
        document.getElementById('urls').value = targetUrls.join("\n");

    }

    document.getElementById('save').addEventListener('onClick', () => {
        saveOptions();
    })

    document.addEventListener('DOMContentLoaded', () => {
        localizeHtmlPage();
        restoreOptions();
        document.getElementById('form').addEventListener('change', saveOptions);
    });
}