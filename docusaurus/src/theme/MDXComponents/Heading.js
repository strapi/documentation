import Heading from '@theme/Heading';
import { AiToolbar } from '../../components/AiToolbar';
import MarkdownAlternateLink from '../../components/MarkdownAlternateLink';
import { useBadgeReorder } from '../../hooks/useBadgeReorder';

export default function MDXHeading(props) {
  const isH1 = props.as === 'h1';

  // Le hook fait tout le travail automatiquement
  useBadgeReorder();

  return (
    <>
      <Heading {...props} />
      {/* The AiToolbar now hosts the "View this page as .md" button (right side). */}
      {isH1 && <AiToolbar />}
      {/* Machine-readable pointer to the page's clean Markdown twin. */}
      {isH1 && <MarkdownAlternateLink />}
    </>
  );
}