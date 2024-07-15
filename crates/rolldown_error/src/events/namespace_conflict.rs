use arcstr::ArcStr;
use oxc::span::Span;

use super::BuildEvent;
use crate::{types::diagnostic_options::DiagnosticOptions, EventKind};
#[derive(Debug)]
pub struct NamespaceConflict {
  pub reexport_module: String,

  pub sources: Vec<String>,

  pub importer: String,

  pub importer_source: ArcStr,

  pub symbol: String,

  pub symbol_span: Span,
}

impl BuildEvent for NamespaceConflict {
  fn kind(&self) -> crate::event_kind::EventKind {
    EventKind::Ambiguous
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!(
      r#""{}" re-exports "{}" from one of the modules {} (will be ignored)."#,
      self.reexport_module,
      self.symbol,
      self.sources.iter().map(|v| format!(r#""{v}""#)).collect::<Vec<_>>().join(" and ")
    )
  }

  fn on_diagnostic(
    &self,
    diagnostic: &mut crate::diagnostic::Diagnostic,
    _opts: &DiagnosticOptions,
  ) {
    let importer_file = diagnostic.add_file(self.importer.clone(), self.importer_source.clone());
    diagnostic.title = self.message(_opts);
    diagnostic.add_label(
      &importer_file,
      self.symbol_span.start..self.symbol_span.end,
      "Found ambiguous export.".to_string(),
    );
  }
}
