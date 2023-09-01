// This proxy serverless function is required for some outside-call
export default async function (payload: { method: string; url: string }) {
  const { url } = payload;

  let apiResponse;
  try {
    apiResponse = await fetch(url);
  } catch (error) {
    console.error("Error1:", error, url);
    return { error, context: "It is possible that you are using 'Settings -> Preferences -> Limit Outbound Connection'. If so, you need to add the host for this URL: " + url };
  }
  try {
    const contentType = apiResponse.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await apiResponse.json();
      console.log("Success");
      return data;
    } else {
      const text = await apiResponse.text();
      console.log("Success");
      return { text };
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {};
    } else {
      console.error("Error2:", error);
      return { error, context: "Error2" };
    }
  }
}
