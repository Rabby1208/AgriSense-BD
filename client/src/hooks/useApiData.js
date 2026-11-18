import { useCallback, useEffect, useState } from "react";

// ব্যবহার:
//   const { data, error, loading, retry } = useApiData(fetchCrops);
//
// জরুরি: fetcher অবশ্যই "স্থির" ফাংশন হতে হবে (module-এর ফাংশন, অথবা useCallback দিয়ে বানানো)।
// fetcher বদলালে নতুন করে তথ্য আনা হয়।
// fetcher হিসেবে null দিলে কিছুই আনা হয় না (যেমন: ফসল এখনো বাছা হয়নি)।

function useApiData(fetcher) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!fetcher) {
      return undefined;
    }

    const controller = new AbortController();

    fetcher({ signal: controller.signal })
      .then((data) => {
        setResult({ fetcher, attempt, data, error: null });
      })
      .catch((error) => {
        // কম্পোনেন্ট বন্ধ বা fetcher বদলানোর কারণে বাতিল হলে কিছু করার নেই
        if (error?.name === "AbortError") {
          return;
        }

        setResult({ fetcher, attempt, data: null, error });
      });

    return () => controller.abort();
  }, [fetcher, attempt]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const settled =
    result !== null && result.fetcher === fetcher && result.attempt === attempt;

  return {
    data: settled ? result.data : null,
    error: settled ? result.error : null,
    loading: Boolean(fetcher) && !settled,
    retry,
  };
}

export default useApiData;