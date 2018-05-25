# -*- coding: utf-8 -*-
"""
  ssbj_base.py generated by WhatsOpt. 
"""
# DO NOT EDIT unless you know what you are doing
# analysis_id: 3

import numpy as np
from openmdao.api import Problem, Group
from openmdao.api import IndepVarComp
from openmdao.api import NonlinearBlockGS, ScipyKrylov

from structure import Structure
from aerodynamics import Aerodynamics
from propulsion import Propulsion
from performance import Performance
from constraints import Constraints

class SsbjBase(Group):
    """ An OpenMDAO base component to encapsulate Ssbj MDA """
    
    def setup(self): 
    
    
        indeps = self.add_subsystem('indeps', IndepVarComp(), promotes=['*'])
		
        indeps.add_output('x_aer', 1.2)
        indeps.add_output('z', np.ones((6,)))
        indeps.add_output('x_pro', 1.0)
        indeps.add_output('x_str', np.ones((2,)))		    
 		
 		
        self.add_subsystem('Structure', self.createStructure(), promotes=['Theta', 'sigma', 'WT', 'L', 'WE', 'x_str', 'z', 'WF'])
        self.add_subsystem('Aerodynamics', self.createAerodynamics(), promotes=['dpdx', 'ESF', 'Theta', 'WT', 'x_aer', 'z', 'D', 'L', 'fin'])
        self.add_subsystem('Propulsion', self.createPropulsion(), promotes=['DT', 'ESF', 'Temp', 'D', 'x_pro', 'z', 'WE', 'SFC'])
        self.add_subsystem('Performance', self.createPerformance(), promotes=['SFC', 'WF', 'WT', 'fin', 'z', 'R'])
        self.add_subsystem('Constraints', self.createConstraints(), promotes=['DT', 'ESF', 'Temp', 'Theta', 'dpdx', 'sigma', 'con_sigma3', 'con_dpdx', 'con_temp', 'con1_esf', 'con_theta_low', 'con_sigma4', 'con_sigma5', 'con2_esf', 'con_sigma1', 'con_sigma2', 'con_dt', 'con_theta_up'])         

        self.nonlinear_solver = NonlinearBlockGS() 
        self.linear_solver = ScipyKrylov()

    
    def create_structure(self):
    	return Structure()
    
    def create_aerodynamics(self):
    	return Aerodynamics()
    
    def create_propulsion(self):
    	return Propulsion()
    
    def create_performance(self):
    	return Performance()
    
    def create_constraints(self):
    	return Constraints()
    