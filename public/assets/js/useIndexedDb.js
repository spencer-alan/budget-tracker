function saveRecord(method, data) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("budget", 1);
    let db,
      tx,
      store;

    request.onupgradeneeded = function(e) {
      const db = request.result;
      db.createObjectStore("toBeStored", { keyPath: "_id" });
    };

    request.onerror = function(e) {
      console.log("There was an error");
    };

    request.onsuccess = function(e) {
      db = request.result;
      tx = db.transaction(["toBeStored"], "readwrite");
      store = tx.objectStore("toBeStored");

      db.onerror = function(e) {
        console.log("error");
      };
      if (method === "clear") {
        store.clear();
      }
      if (method === "post") {
        store.add(data);
      }
      if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function() {
          if (all.result.length > 0) {
            fetch("/api/transaction/bulk", {
              method: "POST",
              body: JSON.stringify(all.result), 
              headers: {
                Accept: "application/json, text/plain. */*",
                "Content-Type": "application/json"
              }
            })
            .then(res => res.json)
            .then(saveRecord("clear"))
          }
          resolve(all.result);
        };
      }
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
};

window.addEventListener("online", saveRecord("get"));