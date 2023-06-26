
function parseUrlEncodedBody(data: string[]){
    const body: any = {};
    data.forEach((entry) => {
      const [key, value] = entry.split("=");
      const decodedKey = decodeURIComponent(key);
      const decodedValue = decodeURIComponent(value);
      body[decodedKey] = decodedValue;
    });
    return body;
}

export default {
    parseUrlEncodedBody
}
