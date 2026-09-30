export async function fetchRemotiveJobs(query?:string) {
      const url=new URL("https://remotive.com/api/remote-jobs");

      if(query){
            url.searchParams.set("search",query);
      }
      const response=await fetch(url);

      if(!response.ok){
            throw new Error(
                  `Remotive API error:${response.status} ${response.statusText}`
            );
      }
      return response.json();
}
