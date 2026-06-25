import Heading from '@theme/Heading';
import { AiToolbar } from '../../components/AiToolbar';
import MarkdownModeLink from '../../components/ViewMode/MarkdownModeLink';
import { useBadgeReorder } from '../../hooks/useBadgeReorder';

export default function MDXHeading(props) {
  const isH1 = props.as === 'h1';

  // Le hook fait tout le travail automatiquement
  useBadgeReorder();

  return (
    <>
      <Heading {...props} />
      {isH1 && <AiToolbar />}
      {/* Discreet ".md" link, only visible in markdown view mode (CSS-gated). */}
      {isH1 && <MarkdownModeLink />}
    </>
  );
}