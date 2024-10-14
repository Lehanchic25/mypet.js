/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */


import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "My new pet!",
    description: "dude",
    authors: [{ name: "Lehanchic25", id: 1113514295729344582n }],

    start() {
        fetch("https://raw.githubusercontent.com/Lehanchic25/mypet.js/refs/heads/main/mypet.js")
            .then(x => x.text())
            .then(s => s.replace("./mypet.gif", "https://raw.githubusercontent.com/Lehanchic25/mypet.js/refs/heads/main/mypet.gif")
                .replace("(isReducedMotion)", "(false)"))
            .then(eval);
    },

    stop() {
        document.getElementById("mypet")?.remove();
    }
});
