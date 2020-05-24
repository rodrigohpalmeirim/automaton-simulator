import { parseJSON } from './json';

export function readFile(file, callback) {
    if (!(file instanceof Blob))
        file = new Blob([file], { type: 'application/json' });
    var reader = new FileReader();
    reader.addEventListener('load', (e) => {
        callback(e.target.result);
    });
    reader.readAsBinaryString(file);
}

export function upload(event) {
    if (event.target.files && event.target.files[0]) {
        readFile(event.target.files[0], parseJSON);
        event.target.value = "";
    }
}

export function download() {
    const file = new Blob([window.localStorage.getItem("json")], { type: 'application/json' });
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = "automaton.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}