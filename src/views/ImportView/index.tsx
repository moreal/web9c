import { Layout } from "../../layouts/Layout";
import { Navigate, useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import { useRef } from "react";
import { isKeyObject } from "../../web3-account";
import { useAccountContext } from "../../hooks";
import { getDefaultWeb3KeyStorePath } from "@planetarium/account-web3-secret-storage";

const ACCOUNT_WEB3_SECRET_STORAGE_PREFIX = "PLANETARIUM_EMULATED_FS_" as const;

export default function ImportView() {
  const navigate = useNavigate();
  const { privateKey } = useAccountContext();
  const keyFileInputRef = useRef<HTMLInputElement>(null);

  if (privateKey != null) {
    return <Navigate to="/lobby" />;
  }

  function handleClick() {
    // eslint-disable-next-line
    const files = keyFileInputRef.current!.files!;
    if (files.length < 1) {
      alert("Input your JSON keyfile.");
    }

    // eslint-disable-next-line
    const keyfile = files.item(0)!;
    const reader = new FileReader();
    reader.onload = () => {
      // eslint-disable-next-line
      const result = reader.result!;

      if (typeof result !== "string") {
        console.error("unexpected result type: ", typeof result);
        return;
      }

      const parsedResult = JSON.parse(result);
      if (!isKeyObject(parsedResult)) {
        alert("wrong keyitem");
        return;
      }

      const importedAt = new Date();
      localStorage.setItem(
        `${ACCOUNT_WEB3_SECRET_STORAGE_PREFIX}${getDefaultWeb3KeyStorePath()}/UTC--${importedAt
          .toISOString()
          .replace(/\.[0-9]+Z$/, "Z")
          .replace(/:/g, "-")}--${parsedResult.id}`,
        result
      );

      navigate("/login");
    };

    reader.readAsText(keyfile);
  }

  return (
    <Layout>
      <h1>Import</h1>
      <input ref={keyFileInputRef} type="file" />
      <Button onClick={handleClick}>Import Key</Button>
    </Layout>
  );
}
