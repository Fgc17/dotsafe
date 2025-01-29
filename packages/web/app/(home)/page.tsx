import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-1 text-2xl font-bold">dotsafe</h1>
      <p className="text-fd-muted-foreground">
        Dealing once and for all with environment variables and typescript
      </p>
      <p className="mt-8">
        <Link
          href="/docs"
          className="text-fd-foreground font-semibold underline"
        >
          Click here to see the documentation.
        </Link>{" "}
      </p>
    </main>
  );
}
