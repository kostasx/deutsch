javascript:(async function(){

    let lang = "de-DE";
    const ytRegExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const ytMatch = ytRegExp.exec(document.location);
    if ( !ytMatch || !ytMatch[7] ){ return false; }
    const vId = ytMatch[7];
    console.log(vId);
    const res = await fetch(document.location.origin + `/watch?v=${vId}`);
    const data = await res.text();
    const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
    const [match] = regex.exec(data);
    const json = JSON.parse(match+"}");
    console.log(json);
    let languageCodes = "";
    Object.values(json.captionTracks).forEach( captionTrack =>{
        // console.log(captionTrack.languageCode);
        languageCodes += captionTrack.languageCode + "\n"; 
    })
    const _lang = prompt(`Please select language code (default: de-DE):
        ${languageCodes}
    `);
    if ( _lang.length > 0 ){
        lang = _lang;
    }
    const [caption] = Object.values(json.captionTracks).filter( caption=>{
        // console.log(caption);
        return caption.vssId === `.${lang}`
    });
    // console.log(caption.baseUrl);
    const res2 = await fetch(caption.baseUrl);
    const xml = await res2.text();

    // console.log( xml );

    const blob = new Blob([xml], {type: 'application/xml'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = `youtube-${vId}.subs.xml`;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }

})();