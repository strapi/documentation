import React from 'react';
import { InkeepSearchButton, InkeepChatButton } from '../../components/Inkeep';

export default function CustomSearchBarWrapper(props) {
  return (
    <div className="my-custom-search-bar">
      {/* Bouton de recherche Inkeep */}
      <InkeepSearchButton />
      
      {/* Bouton de chat IA Inkeep */}
      <InkeepChatButton />
    </div>
  );
}