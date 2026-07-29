
exports.handler = async function () {
  try {
    const url = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter");
    const p = {date:"today",station:"8533615",product:"predictions",datum:"MLLW",time_zone:"lst_ldt",interval:"hilo",units:"english",application:"TheKnaffGuide",format:"json"};
    Object.entries(p).forEach(([k,v])=>url.searchParams.set(k,v));
    const data = await fetch(url).then(r=>{if(!r.ok) throw new Error(`NOAA tides ${r.status}`); return r.json();});
    return response(200,{station:"Barnegat Inlet",predictions:(data.predictions||[]).slice(0,4)});
  } catch(e){ return response(500,{error:e.message}); }
}
function response(statusCode, body){ return {statusCode,headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=1800"},body:JSON.stringify(body)}; }
