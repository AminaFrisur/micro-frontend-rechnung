export default class UserCache {
    cachedUser;
    timestamp;
    cacheTime;
    maxSize;
    // cacheTime immer in Millisekunden angeben
    constructor(cacheTime, maxSize) {
        this.cachedUser = new Array();
        this.timestamp = new Date();
        this.cacheTime = cacheTime;
        this.maxSize = maxSize;
    }

    clearCache() {
        // Map speichert in Insertion Order
        console.log("Cache: Prüfe ob Einträge aus dem Cache gelöscht werden können");
        if (this.cachedUser.size > this.maxSize) {
            // kompletter reset des caches
            // sollte aber eigentlich nicht passieren
            this.cachedUser = [];
            return;
        }

        let tempIndex = this.cachedUser.length
        let check = true;

        while (check) {
            tempIndex = parseInt(tempIndex / 2);
            console.log("Cache: TempIndex ist " + tempIndex);
            // Falls im Cache nur ein Element ist
            if (tempIndex >= 1) {

                // Array ist größer als 1 also mache teile und hersche
                console.log(this.cachedUser[tempIndex - 1]);
                let timeDiff = new Date() - this.cachedUser[tempIndex - 1].cacheTimestamp;
                console.log(timeDiff - this.cacheTime);
                // Wenn für den Eintrag die Cache Time erreicht ist -> lösche die hälfte vom Part des Arrays was betrachtet wird
                // Damit sind dann nicht alle alten Cache einträge gelöscht -> aber das clearen vom Cache sollte schnell gehen
                if (timeDiff >= this.cacheTime) {
                    console.log("Cache: Clear Cache");
                    this.cachedUser = [
                        ...this.cachedUser.slice(tempIndex)
                    ]
                    check = false;
                }

                // Wenn timeDiff noch stimmt dann mache weiter

            } else {

                // auch wenn das eine Element im Array ein alter Eintrag ist
                // kann dies vernachlässigt werden bzw. ist nicht so wichtig
                console.log("Cache: nichts zu clearen")
                check = false;
            }


        }

        console.log(this.cachedUser);
    }

    getUserIndex(loginName) {
        // an dieser Stelle erst den Cache leeren
        // wenn clearCache an andere Stelle aufgerufen wird, dann stimmt der Index nicht mehr
        this.clearCache();
        let finalIndex = -1;
        // O(N) -> Aufwand bei jedem cache durchlauf
        for (var i = 0; i < this.cachedUser.length; i++) {
            console.log(this.cachedUser[i].loginName);
            if(this.cachedUser[i].loginName == loginName) {
                finalIndex = i;
                // Auch beim Suchen eines Users -> Timestamp für Cache Eintrag aktualisieren
                console.log("Cache: Update Timestamp vom Cache Eintrag");
                this.cachedUser[i].cacheTimestamp = new Date();
                break;
            }
        }
        console.log("Cache: User Index ist:" + finalIndex);
        return finalIndex;
    }


    updateOrInsertCachedUser(index, loginName, authToken, authTokenTimestamp, isAdmin) {
        if(index >= 0 ) {
            // update Nutzer
            console.log("Cache: mache ein Update zum User");
            let user = this.cachedUser[index];
            user.authToken = authToken;
            user.authTokenTimestamp = authTokenTimestamp;
            user.cacheTimestamp = new Date();
            this.cachedUser = [
                ...this.cachedUser.slice(0, index),
                ...this.cachedUser.slice(index + 1)
            ]
            console.log("Cache: update User Cache");
            this.cachedUser.push(user);
            console.log(this.cachedUser);
        } else {
            // Füge User neu im Cache hinzu, da nicht im cache vorhanden
            console.log("Cache: Füge neuen Eintrag in Cache hinzu");
            this.cachedUser.push({"loginName": loginName,"authToken": authToken, "authTokenTimestamp": authTokenTimestamp, "isAdmin": isAdmin, "cacheTimestamp": new Date()});
            console.log(this.cachedUser);
        }
    }

    // prüfe ob das Token noch im Gültigkeitszeitraum liegt
    // wenn nicht dann muss ein neues Token vom Microservice Benutzerverwaltung angefordert werden
    checkToken(index, authToken, isAdmin) {
        // User wurde gefunden, prüfe nun token und Timestamp vom token
        if(index >= 0) {
            if(authToken != this.cachedUser[index].authToken) {console.log("Cache: Token aus dem Header stimmt nicht mit dem Token aus dem cache überein"); return false};
            if(this.cachedUser[index].isAdmin != true && isAdmin == true) {console.log("Cache: isAdmin ist false"); return false};

            // Rechne von Millisekunden auf Stunden um
            let timeDiff = (new Date() - this.cachedUser[index].authTokenTimestamp) / 3600000;
            // Wenn token älter ist als 24 Stunden
            if(timeDiff > 24) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

}