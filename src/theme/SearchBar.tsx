import React, {type ReactNode} from 'react';
import SearchBar from '@theme-original/SearchBar';
import AskCookbook from '@cookbookdev/docsbot/react'
import type SearchBarType from '@theme/SearchBar';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof SearchBarType>;

const COOKBOOK_PUBLIC_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODI2NDYwNmFiYTQyMjdjNzM4OGMzNzUiLCJpYXQiOjE3NDczMzg3NTgsImV4cCI6MjA2MjkxNDc1OH0.t7wQtCXRjmNhfcyrdhVxK2l9kDQJTdUoZm9e87lwIh8";

export default function SearchBarWrapper(props) {
  return (
    <>
      <SearchBar {...props} />
     <AskCookbook apiKey={COOKBOOK_PUBLIC_API_KEY} />
    </>
  );
}
