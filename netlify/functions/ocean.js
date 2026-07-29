
exports.handler = async function () {
  try {
    const text = await fetch("https://www.ndbc.noaa.gov/data/realtime2/44091.txt").then(r=>{if(!r.ok) throw new Error(`NDBC ${r.status}`);return r.text();});
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].replace(/^#/,"").trim().split(/\s+/);
    const units = lines[1].replace(/^#/,"").trim().split(/\s+/);
    const vals = lines[2].trim().split(/\s+/);
    const row = Object.fromEntries(headers.map((h,i)=>[h,vals[i]]));
    const c = value(row.WTMP), waveM = value(row.WVHT);
    return response(200,{
      station:"NOAA Buoy 44091 near Barnegat Light",
      waterF: c == null ? null : Math.round((c*9/5+32)*10)/10,
      waterC:c,
      waveFt: waveM == null ? null : Math.round((waveM*3.28084)*10)/10,
      observedUTC: `${row.YY}-${row.MM}-${row.DD} ${row.hh}:${row.mm} UTC`
    });
  } catch(e){ return response(500,{error:e.message}); }
}
function value(x){ return (!x || x==="MM") ? null : Number(x); }
function response(statusCode, body){ return {statusCode,headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=1800"},body:JSON.stringify(body)}; }
