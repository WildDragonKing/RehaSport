import { Fragment } from "react";
import { Link } from "react-router-dom";
import type {
  BlockContent,
  DefinitionContent,
  InlineCode,
  Paragraph,
  PhrasingContent,
  RootContent,
  Text,
} from "mdast";

import type { Content } from "mdast";

type MarkdownNode =
  | Content
  | RootContent
  | BlockContent
  | DefinitionContent
  | PhrasingContent;

interface MarkdownContentProps {
  nodes: Content[];
}

function isText(node: MarkdownNode): node is Text {
  return node.type === "text";
}

function isInlineCode(node: MarkdownNode): node is InlineCode {
  return node.type === "inlineCode";
}

function renderChildren(
  children: MarkdownNode[] | undefined,
  keyPrefix: string,
): JSX.Element[] {
  if (!children) {
    return [];
  }

  return children.map((child, index) =>
    renderNode(child, `${keyPrefix}-${index}`),
  );
}

function resolveLinkTarget(url: string): string {
  const exerciseMatch = url.match(/([^/]+)\.md$/);
  if (exerciseMatch) {
    return `/uebungen/${exerciseMatch[1]}`;
  }
  if (url.startsWith("http")) {
    return url;
  }
  return url;
}

function renderNode(node: MarkdownNode, key: string): JSX.Element {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderChildren(node.children, key)}</p>;
    case "list": {
      const Tag = node.ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          start={node.start ?? undefined}
          className={node.spread ? "list--spread" : undefined}
        >
          {renderChildren(node.children, key)}
        </Tag>
      );
    }
    case "listItem": {
      const hasSingleParagraph =
        node.children.length === 1 && node.children[0]?.type === "paragraph";
      const paragraph = hasSingleParagraph
        ? (node.children[0] as Paragraph)
        : undefined;
      return (
        <li
          key={key}
          className={
            node.checked !== null && node.checked !== undefined
              ? "list-item--task"
              : undefined
          }
        >
          {node.checked !== null && node.checked !== undefined ? (
            <span aria-hidden="true">{node.checked ? "☑" : "☐"}</span>
          ) : null}
          {hasSingleParagraph && paragraph
            ? renderChildren(paragraph.children as MarkdownNode[], key)
            : renderChildren(node.children, key)}
        </li>
      );
    }
    case "strong":
      return <strong key={key}>{renderChildren(node.children, key)}</strong>;
    case "emphasis":
      return <em key={key}>{renderChildren(node.children, key)}</em>;
    case "break":
      return <br key={key} />;
    case "thematicBreak":
      return <hr key={key} className="markdown-separator" />;
    case "heading": {
      const depth = Math.min(node.depth + 1, 6);
      const HeadingTag = `h${depth}` as unknown as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={key}>{renderChildren(node.children, key)}</HeadingTag>
      );
    }
    case "link": {
      const target = resolveLinkTarget(node.url);
      const isExternal = target.startsWith("http");
      const linkContent = renderChildren(node.children, key);
      if (isExternal) {
        return (
          <a key={key} href={target} target="_blank" rel="noreferrer">
            {linkContent}
          </a>
        );
      }
      return (
        <Link key={key} to={target} className="markdown-link">
          {linkContent}
        </Link>
      );
    }
    case "inlineCode": {
      return <code key={key}>{(node as InlineCode).value}</code>;
    }
    case "code": {
      return (
        <pre key={key}>
          <code>{node.value}</code>
        </pre>
      );
    }
    case "blockquote":
      return (
        <blockquote key={key}>{renderChildren(node.children, key)}</blockquote>
      );
    case "table": {
      return (
        <div key={key} className="markdown-table-wrapper">
          <table>
            <tbody>
              {node.children.map((row, rowIndex) => (
                <tr key={`${key}-row-${rowIndex}`}>
                  {row.children.map((cell, cellIndex) => {
                    const CellTag = rowIndex === 0 ? "th" : "td";
                    return (
                      <CellTag key={`${key}-cell-${rowIndex}-${cellIndex}`}>
                        {renderChildren(
                          cell.children,
                          `${key}-cell-${rowIndex}-${cellIndex}`,
                        )}
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "html": {
      return <Fragment key={key} />;
    }
    default: {
      if (isText(node)) {
        return <Fragment key={key}>{node.value}</Fragment>;
      }
      return <Fragment key={key} />;
    }
  }
}

function MarkdownContent({ nodes }: MarkdownContentProps): JSX.Element {
  return <>{renderChildren(nodes, "md")}</>;
}

export default MarkdownContent;
