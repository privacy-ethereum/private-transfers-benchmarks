const URL_REGEX = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?])/g;
const URL_TEST_REGEX = /^https?:\/\//;

export default function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <>
      {parts.map((part, i) =>
        URL_TEST_REGEX.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer" className="ext-link">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
