import Heading from '@theme/Heading';
import { AiToolbar } from '../../components/AiToolbar';
import { useBadgeReorder } from '../../hooks/useBadgeReorder';

export default function MDXHeading(props) {
  const isH1 = props.as === 'h1';
  
  // Le hook fait tout le travail automatiquement
  useBadgeReorder();
  
  return (
    <>
      <Heading {...props} />
      {isH1 && <AiToolbar />}
    </>
  );
}