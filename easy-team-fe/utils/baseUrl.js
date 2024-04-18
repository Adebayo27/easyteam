// create base url for the API
export const baseUrl = "http://localhost:5000/api";

export const handleCallApiPost = async (url, data) => {
  const response = await fetch(`${baseUrl}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return null
    });
    return response
};

export const handleCallApiGet = async (url) => {
    const response = await fetch(`${baseUrl}/${url}`);
    const data = await response.json();
    return data
}

