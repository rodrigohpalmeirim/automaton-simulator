import { parseJSON } from './json';

export function upload(event) {
    if (event.target.files && event.target.files[0]) {
        var myFile = event.target.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
            parseJSON(e.target.result);
        });

        reader.readAsBinaryString(myFile);
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