use crate::PluginContext;
use oxc::sourcemap::Token;
use oxc_sourcemap::SourceMap as oxcSourceMap;
use rolldown_sourcemap::{collapse_sourcemaps, SourceMap};
use string_wizard::{MagicString, SourceMapOptions};
#[allow(unused)]
#[derive(Debug)]
pub struct TransformPluginContext<'a> {
  pub inner: PluginContext,
  sourcemap_chain: &'a Vec<SourceMap>,
  original_code: &'a str,
  id: &'a str,
}

impl<'a> TransformPluginContext<'a> {
  pub fn new(
    inner: PluginContext,
    sourcemap_chain: &'a Vec<SourceMap>,
    original_code: &'a str,
    id: &'a str,
  ) -> Self {
    Self { inner, sourcemap_chain, original_code, id }
  }

  pub fn get_combined_sourcemap(&self) -> SourceMap {
    if self.sourcemap_chain.is_empty() {
      self.create_sourcemap()
    } else if self.sourcemap_chain.len() == 1 {
      // TODO (fix): clone is not necessary
      self.sourcemap_chain.first().expect("should have one sourcemap").clone()
    } else {
      let sourcemap_chain = self.sourcemap_chain.iter().collect::<Vec<_>>();
      // TODO Here could be cache result for pervious sourcemap_chain, only remapping new sourcemap chain
      collapse_sourcemaps(sourcemap_chain)
      // .unwrap_or_else(|| self.create_sourcemap())
    }
  }

  fn create_sourcemap(&self) -> SourceMap {
    let magic_string = MagicString::new(self.original_code);
    magic_string
      .source_map(SourceMapOptions { hires: true, include_content: true, source: self.id.into() })
      .into_source_map()
  }
}

trait TransformVersion {
  fn into_source_map(&self) -> SourceMap;
}

impl TransformVersion for oxcSourceMap {
  fn into_source_map(&self) -> SourceMap {
    SourceMap::new(
      self.get_file().map(Into::into),
      self.get_names().map(Into::into).collect::<Vec<_>>(),
      self.get_source_root().map(str::to_string),
      self.get_sources().map(Into::into).collect::<Vec<_>>(),
      self.get_source_contents().map(|x| x.map(Into::into).collect::<Vec<_>>()),
      self
        .get_tokens()
        .map(|x| {
          Token::new(
            x.get_dst_line(),
            x.get_dst_col(),
            x.get_src_line(),
            x.get_src_col(),
            x.get_source_id(),
            x.get_name_id(),
          )
        })
        .collect::<Vec<_>>(),
      None,
    )
  }
}
