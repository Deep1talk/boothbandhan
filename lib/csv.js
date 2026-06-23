function escapeCsvValue(value) {
  const normalized =
    value === null || value === undefined ? "" : String(value).replace(/\r?\n/g, " ");

  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function createCsvContent(headers, rows) {
  const headerLine = headers.map((header) => escapeCsvValue(header.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header.key])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

export function createCsvResponse(filename, content) {
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
