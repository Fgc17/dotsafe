import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-1 text-2xl font-bold">fatima</h1>
      <p className="text-fd-muted-foreground">
        typesafe environment variables for the js ecosystem
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
