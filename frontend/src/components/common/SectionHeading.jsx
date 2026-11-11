// Shared section heading: small index label, two-tone title, optional intro paragraph.
export default function SectionHeading({ index, label, line1, line2, intro, as: Tag = "h2" }) {
  return (
    <div className={intro ? "section-heading section-heading--split" : "section-heading"}>
      <div>
        <p className="section-label">
          <span>{index}</span>
          {label}
        </p>
        <Tag className="section-title">
          {line1}
          {line2 && (
            <>
              <br />
              <span>{line2}</span>
            </>
          )}
        </Tag>
      </div>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}
