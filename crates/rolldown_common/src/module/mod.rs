pub mod external_module;

use crate::{EcmaModule, ExternalModule, ModuleIdx};

#[derive(Debug)]
pub enum Module {
  Ecma(Box<EcmaModule>),
  External(Box<ExternalModule>),
}

impl Module {
  pub fn idx(&self) -> ModuleIdx {
    match self {
      Module::Ecma(v) => v.idx,
      Module::External(v) => v.idx,
    }
  }

  pub fn exec_order(&self) -> u32 {
    match self {
      Module::Ecma(v) => v.exec_order,
      Module::External(v) => v.exec_order,
    }
  }

  pub fn id(&self) -> &str {
    match self {
      Module::Ecma(v) => &v.id,
      Module::External(v) => &v.name,
    }
  }

  pub fn side_effects(&self) -> &crate::side_effects::DeterminedSideEffects {
    match self {
      Module::Ecma(v) => &v.side_effects,
      Module::External(v) => &v.side_effects,
    }
  }

  pub fn stable_id(&self) -> &str {
    match self {
      Module::Ecma(v) => &v.stable_id,
      Module::External(v) => &v.name,
    }
  }

  pub fn ecma(v: EcmaModule) -> Self {
    Module::Ecma(Box::new(v))
  }

  pub fn external(v: ExternalModule) -> Self {
    Module::External(Box::new(v))
  }

  pub fn as_ecma(&self) -> Option<&EcmaModule> {
    match self {
      Module::Ecma(v) => Some(v),
      Module::External(_) => None,
    }
  }

  pub fn as_external(&self) -> Option<&ExternalModule> {
    match self {
      Module::External(v) => Some(v),
      Module::Ecma(_) => None,
    }
  }

  pub fn as_ecma_mut(&mut self) -> Option<&mut EcmaModule> {
    match self {
      Module::Ecma(v) => Some(v),
      Module::External(_) => None,
    }
  }

  pub fn as_external_mut(&mut self) -> Option<&mut ExternalModule> {
    match self {
      Module::External(v) => Some(v),
      Module::Ecma(_) => None,
    }
  }
}

impl From<EcmaModule> for Module {
  fn from(module: EcmaModule) -> Self {
    Module::Ecma(Box::new(module))
  }
}

impl From<ExternalModule> for Module {
  fn from(module: ExternalModule) -> Self {
    Module::External(Box::new(module))
  }
}
