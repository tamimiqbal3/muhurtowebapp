import { Notice } from "./misc";
import { ButtonLink } from "./Button";

export function FirebaseSetupNotice({ feature = "This page" }: { feature?: string }) {
  return (
    <div className="container-x py-36">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-5xl">Almost ready</h1>
        <Notice tone="warning" title="Firebase is not configured on this deployment">
          {feature} needs accounts and a database. Add the Firebase environment variables (see <code>.env.example</code> and the README), redeploy, and this page will work. Browsing, search, customisation and the AI planner work without it.
        </Notice>
        <ButtonLink href="/" variant="outline">Back to home</ButtonLink>
      </div>
    </div>
  );
}
