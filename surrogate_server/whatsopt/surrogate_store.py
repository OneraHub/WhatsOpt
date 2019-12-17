import numpy as np
import os
from shutil import copyfile

try:
    import cPickle as pickle
except:
    import pickle

SMT_NOT_INSTALLED = False
try:
    from smt.surrogate_models import KRG, KPLS, KPLSK, LS, QP
except:
    SMT_NOT_INSTALLED = True

OPENTURNS_NOT_INSTALLED = False
try:
    from .openturns_surrogates import PCE
except:
    OPENTURNS_NOT_INSTALLED = True


class SurrogateStore(object):
    """
    Object responsible for saving / loading / listing trained surrogates
    """

    SURROGATE_NAMES = ["KRIGING", "KPLS", "KPLSK", "LS", "QP", "OPENTURNS_PCE"]

    def __init__(self, outdir="."):
        self.outdir = outdir
        self.surrogate_classes = {
            "KRIGING": KRG,
            "KPLS": KPLS,
            "KPLSK": KPLSK,
            "LS": LS,
            "QP": QP,
            "OPENTURNS_PCE": PCE,
        }
        if not os.path.exists(outdir):
            os.makedirs(outdir)

    def create_surrogate(self, surrogate_id, surrogate_kind, xt, yt):
        if surrogate_kind not in SurrogateStore.SURROGATE_NAMES:
            raise Exception(
                "Unknown surrogate {} not in {}".format(
                    surrogate_kind, SurrogateStore.SURROGATE_NAMES
                )
            )
        sm = self.surrogate_classes[surrogate_kind]()
        sm.set_training_values(np.array(xt), np.array(yt))
        sm.train()

        filename = self._sm_filename(surrogate_id)
        print("DUMP ", filename)
        with open(filename, "wb") as f:
            pickle.dump(sm, f)
        return sm

    def get_surrogate(self, surrogate_id):
        filename = self._sm_filename(surrogate_id)
        sm = None
        with open(filename, "rb") as f:
            sm = pickle.load(f)
        return sm

    def destroy_surrogate(self, surrogate_id):
        filename = self._sm_filename(surrogate_id)
        if os.path.exists(filename):
            os.remove(filename)

    def copy_surrogate(self, src_id, dst_id):
        src = self._sm_filename(src_id)
        dst = self._sm_filename(dst_id)
        copyfile(src, dst)

    def _sm_filename(self, surrogate_id):
        return "%s/surrogate_%s.pkl" % (self.outdir, surrogate_id)

